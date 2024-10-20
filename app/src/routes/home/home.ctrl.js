"use strict";

const mysql = require("../../mysql/home/mysql");

const output = {
    home: (req, res) => {
        res.render("home/index");
    },
    login: (req, res) => {
        res.render("home/login");
    },
};

const process = {
    login: (req, res) => {
        const id = req.body.id,
            password = req.body.password;

        mysql.query(`select password from user where login_id = '${id}'`, (error, results, fields) => {
            if (error) throw error;
            if (results.length == 1) {
                if (results[0]["password"] == password) {
                    return res.json({
                        success: true,
                    });
                } else {
                    return res.json({
                        success: false,
                        msg: "틀린 비밀번호입니다.",
                    });
                }
            } else {
                return res.json({
                    success: false,
                    msg: "찾을 수 없는 ID 입니다.",
                });
            }
        });
    },
};

module.exports = {
    output,
    process,
};