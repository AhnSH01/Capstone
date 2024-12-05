"use strict";

const AWS = require("aws-sdk");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// AWS S3 설정
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY

AWS.config.update({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_KEY,
  // region: "YOUR_REGION",
});

const s3 = new AWS.S3();

// S3 버킷 이름 설정
const BUCKET_NAME = process.env.AWS_BUCKET;

class S3 {
  async upload(inputStream) {
    const dateString = new Date().toISOString().replace(/[:.]/g, "-");
    const key = `live/${dateString}/stream.m3u8`;

    const command = ffmpeg(inputStream)
      .inputFormat("mjpeg")
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions([
        "-hls_time 10",
        "-hls_list_size 6",
        "-hls_wrap 10",
        "-hls_delete_threshold 1",
      ])
      .output(`s3://${BUCKET_NAME}/${key}`);

    command.on("start", () => {
      console.log("스트리밍 시작");
    });

    command.on("error", (err) => {
      console.error("스트리밍 오류:", err);
    });

    command.run();
  }
}

module.exports = S3;
