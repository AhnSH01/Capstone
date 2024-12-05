const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const app = express();

// AWS S3 설정
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const bucket = process.env.AWS_BUCKET;

// ESP32-CAM MJPEG 스트림 URL
const ESP32_STREAM_URL = process.env.ESP32_STREAM_URL;
// const ESP32_STREAM_URL = "http://localhost:5000/stream";
//  curl -X POST http://localhost:3000/start_hls
//  curl -X POST http://localhost:3000/stop_hls

// HLS 출력 디렉토리
const HLS_OUTPUT_DIR = "hls_output";
if (!fs.existsSync(HLS_OUTPUT_DIR)) {
    fs.mkdirSync(HLS_OUTPUT_DIR);
}

// 전역 변수로 프로세스 상태 관리
let ffmpegProcess = null;
let isStreaming = false;
let streamStartTime = null;

function clearHlsOutput() {
    fs.readdirSync(HLS_OUTPUT_DIR).forEach(file => {
        const filePath = path.join(HLS_OUTPUT_DIR, file);
        if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
        }
    });
}

async function periodicUpload() {
    while (isStreaming) {
        try {
            const currentFiles = fs.readdirSync(HLS_OUTPUT_DIR);
            const tsFiles = currentFiles.filter(f => f.endsWith('.ts'));

            // .ts 파일 업로드 및 삭제
            for (const filename of tsFiles.sort()) {
                if (!isStreaming) break;

                const filePath = path.join(HLS_OUTPUT_DIR, filename);
                try {
                    await s3.upload({
                        Bucket: bucket,
                        Key: `${streamStartTime}/${filename}`,
                        Body: fs.createReadStream(filePath)
                    }).promise();

                    console.log(`Uploaded TS: ${filename}`);
                    fs.unlinkSync(filePath);
                } catch (e) {
                    console.error(`Error uploading ${filename}:`, e);
                }
            }

            // m3u8 파일 업로드
            const m3u8FilePath = path.join(HLS_OUTPUT_DIR, "stream.m3u8");
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                await s3.upload({
                    Bucket: bucket,
                    Key: `${streamStartTime}/stream.m3u8`,
                    Body: fs.createReadStream(m3u8FilePath)
                }).promise();
                console.log("Uploaded M3U8: stream.m3u8");
            } catch (e) {
                console.error("Error uploading stream.m3u8:", e);
            }

            console.log("Upload cycle completed");
        } catch (e) {
            console.error("Upload error:", e);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

app.post('/start_hls', async (req, res) => {
    try {
        if (isStreaming) {
            return res.status(400).json({ message: "Streaming is already running" });
        }

        if (ffmpegProcess) {
            ffmpegProcess.kill();
            ffmpegProcess = null;
        }

        clearHlsOutput();

        isStreaming = true;
        if (!streamStartTime) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hour = String(now.getHours()).padStart(2, '0');
            const minute = String(now.getMinutes()).padStart(2, '0');
            streamStartTime = `${year}-${month}-${day}T${hour}${minute}`;
        }

        ffmpegProcess = ffmpeg(ESP32_STREAM_URL)
            .outputOptions([
                '-c:v libx264',
                '-preset ultrafast',
                '-f hls',
                '-hls_time 5',
                '-hls_list_size 0',
                '-hls_playlist_type event'
            ])
            .output(path.join(HLS_OUTPUT_DIR, 'stream.m3u8'))
            .on('error', (err) => {
                console.error('FFmpeg error:', err);
                isStreaming = false;
            });

        ffmpegProcess.run();
        periodicUpload();

        res.json({ message: "HLS streaming started" });
    } catch (error) {
        isStreaming = false;
        res.status(500).json({ error: error.message });
    }
});

app.post('/stop_hls', (req, res) => {
    try {
        if (!isStreaming) {
            return res.status(400).json({ message: "No active streaming to stop" });
        }

        isStreaming = false;
        streamStartTime = null;

        if (ffmpegProcess) {
            ffmpegProcess.kill();
            ffmpegProcess = null;
        }

        clearHlsOutput();

        res.json({ message: "HLS streaming stopped" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

process.on('SIGINT', () => {
    isStreaming = false;
    if (ffmpegProcess) {
        ffmpegProcess.kill();
    }
    console.log("Cleanup completed");
    process.exit(0);
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000');
}); 