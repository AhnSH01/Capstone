"use strict";

const { log } = require("../../config/logger");
const Video = require("../../models/video/Video");

// Get 요청 처리
const _read = {
    option: async (req, res) => {
        const option = new Option(req.query);
        const response = await option.getOption();

        const url = {
            method: "GET",
            path: "/option",
            status: response.error ? 409 : 201,
        };

        log(response, url);
        return res.json(response);
    },
};

// Post 요청 처리
const _create = {
    option: async (req, res) => {
        const option = new Option(req.body);
        const response = await option.createOption();

        const url = {
            method: "POST",
            path: "/option",
            status: response.error ? 409 : 201,
        };

        log(response, url);
        return res.status(url.status).json(response);
    },
};

// Patch 요청 처리
const _update = {
    option: async (req, res) => {
        const option = new Option(req.body);
        const response = await option.updateOption();

        const url = {
            method: "Patch",
            path: "/option",
            status: response.error ? 409 : 201,
        };

        log(response, url);
        return res.status(url.status).json(response);
    },
};

// Delete 요청 처리
const _delete = {
    user: async (req, res) => {
        const user = new User(req.body);
        const response = await user.deleteUser();

        const url = {
            method: "Delete",
            path: "/user",
            status: response.error !== undefined ? 409 : 201,
        };

        log(response, url);
        return res.status(url.status).json(response);
    },
};

module.exports = {
    _read,
    _create,
    _update,
    _delete,
};