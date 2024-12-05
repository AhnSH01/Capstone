const express = require('express');
const NodeWebcam = require('node-webcam');
const app = express();

// 웹캠 설정
const webcamOptions = {
    width: 1280,
    height: 720,
    quality: 100,
    frames: 60,
    output: "jpeg",
    device: false,
    callbackReturn: "buffer"
};

const Webcam = NodeWebcam.create(webcamOptions);

// MJPEG 스트림 생성을 위한 함수
function generateFrames(res) {
    const boundary = 'frame';
    res.writeHead(200, {
        'Content-Type': `multipart/x-mixed-replace; boundary=${boundary}`,
        'Cache-Control': 'no-cache',
        'Connection': 'close',
        'Pragma': 'no-cache'
    });

    // 주기적으로 프레임 캡처 및 전송
    const captureFrame = () => {
        Webcam.capture('', (err, data) => {
            if (err) {
                console.error('웹캠 캡처 오류:', err);
                return;
            }
            res.write(`--${boundary}\r\n`);
            res.write('Content-Type: image/jpeg\r\n');
            res.write('Content-Length: ' + data.length + '\r\n');
            res.write('\r\n');
            res.write(data);
            res.write('\r\n');
        });
    };

    // 60fps로 프레임 전송
    const interval = setInterval(captureFrame, 1000 / 60);

    // 클라이언트 연결이 종료되면 인터벌 정리
    res.on('close', () => {
        clearInterval(interval);
    });
}

// 스트리밍 라우트
app.get('/stream', (req, res) => {
    generateFrames(res);
});

// 서버 시작
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 