"use strict";

const logger = require("../../config/logger");
const User = require("../../models/User");

// Get 요청 처리
const output = {
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
    accesstoken: async (req, res) => {
        const user = new User(req.cookies);
        const response = await user.accessToken();
        return res.json(response);
    },
    refreshtoken: async (req, res) => {
        const user = new User(req.cookies);
        const response = await user.refreshToken();

        if (response.success) {
            res.cookie("accessToken", response.accessToken, {
                secure: false,
                httpOnly: true,
            });
        }

        return res.json(response);
    },
    // loginSuccess: (req, res) => {

    // },
};

// Post 요청 처리
const process = {
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

module.exports = {
    output,
    process,
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