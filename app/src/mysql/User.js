"use strict";

const mysql = require("./mysql");

class User {
    constructor(body) {
        this.body = body;
    }

    login() {
        return new Promise((resolve) => {
            const client = this.body;
            let sql = `select password from user where login_id = '${client.id}'`

            mysql.query(sql, (error, results, fields) => {
                if (error) throw error;
                if (results.length == 1) {
                    if (results[0]["password"] == client.password) {
                        resolve({ success: true });
                    } else {
                        resolve({ success: false, msg: "비밀번호가 틀렸습니다." });
                    }
                } else {
                    resolve({ success: false, msg: "찾을 수 없는 ID 입니다." });
                }
            });
        })
    }

    register() {
        return new Promise((resolve) => {
            const client = this.body;
            let sql = `insert into user (login_id, password, name) VALUES ('${client.id}', '${client.password}', '${client.name}')`;

            mysql.query(sql, (error, results, fields) => {
                if (error) {
                    if (error.errno == 1062) resolve({ success: false, msg: "이미 존재하는 ID입니다." });
                    else throw error;
                } else {
                    resolve({ success: true, msg: "회원가입 완료" });
                } 
            });
        })
    }
}

module.exports = User;