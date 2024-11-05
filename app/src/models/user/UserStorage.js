"use strict";

const db = require("../../config/db");

class UserStorage {
    static getUserInfo(id) {
        return new Promise((resolve, reject) => {
            let query = "select * from user where login_id = ?;";

            db.query(query, [id], (error, results, fields) => {
                if (error) reject(error);
                else resolve(results[0]);
            })
        })
    }

    static async save(userInfo) {
        return new Promise((resolve, reject) => {
            let query = "insert into user (login_id, name, password) VALUES (?, ?, ?);";

            db.query(query, [userInfo.id, userInfo.name, userInfo.password], (error, results, fields) => {
                if (error) reject(error);
                else resolve({ success: true, msg: "회원가입 성공" });
            })
        })
    }

    static async updatePassword(id, new_password) {
        return new Promise((resolve, reject) => {
            let query = "update user set password = ? where id = ?;";

            db.query(query, [new_password, id], (error, results, fields) => {
                if (error) reject(error);
                else resolve({ success: true, msg: "비밀번호 변경 완료" });
            })
        })
    }

    static async updateUser(id, login_id, name, adress, phone_number, gender, age) {
        return new Promise((resolve, reject) => {
            let query = "update user set login_id = ?, name = ?, adress = ?, phone_number = ?, gender = ?, age = ? where id = ?;";

            db.query(query, [login_id, name, adress, phone_number, gender, age, id], (error, results, fields) => {
                if (error) reject(error);
                else resolve({ success: true });
            })
        })
    }
}

module.exports = UserStorage;