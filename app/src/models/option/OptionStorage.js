"use strict";

const db = require("../../config/db");

class OptionStorage {
    static getOptionInfo(id) {
        return new Promise((resolve, reject) => {
            let query = "select * from options where user_id = ?;";

            db.query(query, [id], (error, results, fields) => {
                if (error) reject(error);
                else resolve(results[0]);
            })
        })
    }

    static async save(id) {
        return new Promise((resolve, reject) => {
            let query = "insert into options (user_id) VALUES (?);";

            db.query(query, [id], (error, results, fields) => {
                if (error) reject(error);
                else resolve({ success: true, msg: `user${id} 옵션정보 생성 완료` });
            })
        })
    }

    static async updateOption(id, push, theme, language) {
        return new Promise((resolve, reject) => {
            let query = "update options set push = ?, theme = ?, language = ? where user_id = ?;";

            db.query(query, [push, theme, language, id], (error, results, fields) => {
                if (error) reject(error);
                else resolve({ success: true, msg: `user${id} 옵션정보 수정 완료` });
            })
        })
    }
}

module.exports = OptionStorage;