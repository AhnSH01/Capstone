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

        const response = {};

        mysql.query(`select password from user where login_id = '${id}'`, (error, results, fields) => {
            if (error) throw error;
            if (results.length == 1) {
                if (results[0]["password"] == password) {
                    response.success = true;
                } else {
                    response.success = false;
                    response.msg = "틀린 비밀번호입니다.";
                }
            } else {
                response.success = false;
                response.msg = "찾을 수 없는 ID 입니다.";
            }
        });

        return res.json(response);
    },
};

module.exports = {
    output,
    process,
};