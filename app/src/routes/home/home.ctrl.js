"use strict";

const logger = require("../../config/logger");
const User = require("../../models/User");

// Get 요청 처리
const _read = {
    home: (req, res) => {
        logger.info(`GET / 304 "홈 화면으로 이동"`);
        res.render("home/index");
    },
    login: (req, res) => {
        logger.info(`GET /login 304 "로그인 화면으로 이동"`);
        res.render("home/login");
    },
    register: (req, res) => {
        logger.info(`GET /register 304 "회원가입 화면으로 이동"`);
        res.render("home/register");
    },
    accesstoken: (req, res) => {
        const user = new User(req.query);
        const response = user.accessToken();
        return res.json(response);
    },
    refreshtoken: (req, res) => {
        const user = new User(req.query);
        const response = user.refreshToken();

        if (response.success) {
            res.cookie("accessToken", response.accessToken, {
                secure: false,
                httpOnly: true,
            });
        }

        return res.json(response);
    },
    user: async (req, res) => {  // http://localhost:3000/user?accessToken=토큰값
        const user = new User(req.query);
        const response = await user.getUser();
        return res.json(response);
    },
    // loginSuccess: (req, res) => {

    // },
};

// Post 요청 처리
const _create = {
    login: async (req, res) => {
        const user = new User(req.body);
        const response = await user.login();

        const url = {
            method: "POST",
            path: "/login",
            status: response.error ? 400 : 200,
        };

        if (response.success) {
            res.cookie("accessToken", response.accessToken, {
                secure: false,
                httpOnly: true,
            });

            res.cookie("refreshToken", response.refreshToken, {
                secure: false,
                httpOnly: true,
            });
        }

        log(response, url);
        return res.status(url.status).json(response);
    },
    logout: async (req, res) => {
        try {
            res.cookie('accessToken', '');
            res.status(200).json("로그아웃 성공");
        } catch (error) {
            res.status(500).json(error);
        }
    },
    register: async (req, res) => {
        const user = new User(req.body);
        const response = await user.register();

        const url = {
            method: "POST",
            path: "/register",
            status: response.error ? 409 : 201,
        };

        log(response, url);
        return res.status(url.status).json(response);
    },
};

const log = (response, url) => {
    if (response.error) {
        logger.error(
            `${url.method} ${url.path} ${url.status} "Response: { success: ${response.success}, ${response.error} }"`
        );
    }
    else {
        logger.info(
            `${url.method} ${url.path} ${url.status} "Response: { success: ${response.success}, msg: ${response.msg} }"`
        );
    }
};

// Patch 요청 처리
const _update = {
    password: (req, res) => {
        logger.info(`Patch /user/password 200 "user.password 정보 변경 완료"`);
    },
    name: (req, res) => {
        logger.info(`Patch /user/name 200 "user.name 정보 변경 완료"`);
    },
    adress: (req, res) => {
        logger.info(`Patch /user/adress 200 "user.adress 정보 변경 완료"`);
    },
    phone_number: (req, res) => {
        logger.info(`Patch /user/phone_number 200 "user.phone_number 정보 변경 완료"`);
    },
    gender: (req, res) => {
        logger.info(`Patch /user/gender 200 "user.gender 정보 변경 완료"`);
    },
    age: (req, res) => {
        logger.info(`Patch /user/age 200 "user.age 정보 변경 완료"`);
    },
};

// Delete 요청 처리
const _delete = {
    
};


module.exports = {
    _read,
    _create,
    _update,
    _delete,
};