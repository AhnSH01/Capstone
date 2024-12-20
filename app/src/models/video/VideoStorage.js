"use strict";

const db = require("../../config/db");

class VideoStorage {
    static getVideoInfo(id) {
        return new Promise((resolve, reject) => {
            let query = "select * from video where user_id = ?;";

            db.query(query, [id], (error, results, fields) => {
                if (error) reject(error);
                else resolve(results);
            })
        })
    }

    static getVideoInfoByDate(id, date) {
        return new Promise((resolve, reject) => {
            let query = "select * from video where user_id = ? and DATE(datetime) = ?;";

            db.query(query, [id, date], (error, results, fields) => {
                if (error) reject(error);
                else resolve(results);
            })
        })
    }

    static async save(id, datetime, bucket, key, region, size) {
        return new Promise((resolve, reject) => {
            let query = "insert into video (user_id, datetime, bucket, file_key, region, size) VALUES (?, ?, ?, ?, ?, ?);";

            db.query(query, [id, datetime, bucket, key, region, size], (error, results, fields) => {
                console.log(query);
                if (error) reject(error);
                else resolve({ success: true, msg: `user${id} 비디오정보 생성 완료` });
            })
        })
    }

    static async updateVideo(id, date, S3_URL) {
        return new Promise((resolve, reject) => {
            let query = "update video set S3_URL = ? where user_id = ? and DATE(datetime) = ?;";

            db.query(query, [S3_URL, id, date], (error, results, fields) => {
                if (error) reject(error);
                else resolve({ success: true, msg: `user${id} 비디오정보 수정 완료` });
            })
        })
    }

    static async deleteVideo(id, date) {
        return new Promise((resolve, reject) => {
            let query = "delete from video where user_id = ? and DATE(datetime) = ?;";

            db.query(query, [id, date], (error, results, fields) => {
                if (error) reject(error);
                else resolve({ success: true, msg: "삭제 완료" });
            })
        })
    }
}

module.exports = VideoStorage;