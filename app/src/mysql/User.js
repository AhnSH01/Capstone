"use strict";

const mysql = require("./mysql");

class User {
    constructor(body) {
        this.body = body;
    }

    login() {
        return new Promise((resolve) => {
            const body = this.body;

            mysql.query(`select password from user where login_id = '${body.id}'`, (error, results, fields) => {
                if (error) throw error;
                if (results.length == 1) {
                    if (results[0]["password"] == body.password) {
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
}

module.exports = User;