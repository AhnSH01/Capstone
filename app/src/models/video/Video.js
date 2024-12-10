"use strict";

const VideoStorage = require("./VideoStorage");
const jwt = require("jsonwebtoken");

class Video {
    constructor(body) {
        this.body = body;
    }

    async getVideo() {
        const client = this.body; // accessToken

        try {
            const token = client.accessToken;
            const payload = jwt.verify(token, process.env.ACCESS_SECRET);
            const video = await VideoStorage.getVideoInfo(payload.id);

            if (video) {
                return { success: true, msg: `${payload.name}님 비디오정보 반환 완료`, video };
            } else {
                return { success: false, msg: "유효하지않은 토큰입니다. (해당 유저번호에 대한 정보가 존재하지않음)" };
            }
        } catch (error) {
            return { success: false, error };
        }
    }

    async getVideoByDate() {
        const client = this.body; // accessToken, date
        const regex = /^\d{4}-\d{2}-\d{2}$/;

        if (!client.date) return { success: false, msg: "날짜를 입력해주세요." };
        if (!regex.test(client.date)) return { success: false, msg: "올바르지 않은 날짜 형식입니다." };

        try {
            const token = client.accessToken;
            const payload = jwt.verify(token, process.env.ACCESS_SECRET);
            const video = await VideoStorage.getVideoInfoByDate(payload.id, client.date);

            if (video) {
                return { success: true, msg: `${payload.name}님 비디오정보 반환 완료`, video };
            } else {
                return { success: false, msg: "유효하지않은 토큰입니다. (해당 유저번호 또는 날짜에 대한 정보가 존재하지않음)" };
            }
        } catch (error) {
            return { success: false, error };
        }
    }

    async createVideo() {
        const client = this.body; // id, bucket, key, region, size

        if (!client.id) return { success: false, msg: "user의 id를 입력해주세요." };
        if (!client.bucket) return { success: false, msg: "bucket을 입력해주세요." };
        if (!client.region) return { success: false, msg: "region 입력해주세요." };
        if (!client.key) return { success: false, msg: "key을 입력해주세요." };
        if (!client.size) return { success: false, msg: "size을 입력해주세요." };

        try {
            const dateStr = client.key.substring(0, 15); // yyyymmdd_hhmmss
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            const hour = dateStr.substring(9, 11);
            const minute = dateStr.substring(11, 13);
            const second = dateStr.substring(13, 15);
            const datetime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

            // key에서 segment_xxxxx.ts를 stream.m3u8로 변경
            const key = client.key.split('/')[0] + '/stream.m3u8';

            return await VideoStorage.save(client.id, datetime, client.bucket, key, client.region, client.size);
        } catch (error) {
            return { success: false, error };
        }
    }

    async updateVideo() {
        const client = this.body; // accessToken, date, S3_URL
        const regex = /^\d{4}-\d{2}-\d{2}$/;

        if (!client.date) return { success: false, msg: "날짜를 입력해주세요." };
        if (!regex.test(client.date)) return { success: false, msg: "올바르지 않은 날짜 형식입니다." };
        if (!client.S3_URL) return { success: false, msg: "S3_URL을 입력해주세요." };

        try {
            const token = client.accessToken;
            const payload = jwt.verify(token, process.env.ACCESS_SECRET);
            const video = await VideoStorage.getVideoInfoByDate(payload.id, client.date);

            if (video) {
                return await VideoStorage.updateVideo(payload.id, client.date, client.S3_URL);
            } else {
                return { success: false, msg: "유효하지않은 토큰입니다. (해당 유저번호 또는 날짜에 대한 정보가 존재하지않음)" };
            }
        } catch (error) {
            return { success: false, error };
        }
    }

    async deleteVideo() {
        const client = this.body; // accessToken, date
        const regex = /^\d{4}-\d{2}-\d{2}$/;

        if (!client.date) return { success: false, msg: "날짜를 입력해주세요." };
        if (!regex.test(client.date)) return { success: false, msg: "올바르지 않은 날짜 형식입니다." };

        try {
            const token = client.accessToken;
            const payload = jwt.verify(token, process.env.ACCESS_SECRET);
            const video = await VideoStorage.getVideoInfoByDate(payload.id, client.date);

            if (video) {
                return await VideoStorage.deleteVideo(video.id, client.date);
            } else {
                return { success: false, msg: "유효하지않은 토큰입니다. (해당 유저번호 또는 날짜에 대한 정보가 존재하지않음)" };
            }
        } catch (error) {
            return { success: false, error };
        }
    }
}

module.exports = Video;