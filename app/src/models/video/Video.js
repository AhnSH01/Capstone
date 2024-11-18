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
        const client = this.body; // accessToken, S3_URL

        if (!client.S3_URL) return { success: false, msg: "S3_URL을 입력해주세요." };

        try {
            const token = client.accessToken;
            const payload = jwt.verify(token, process.env.ACCESS_SECRET);

            return await VideoStorage.save(payload.id, client.S3_URL);
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