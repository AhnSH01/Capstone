"use strict";

const { log } = require("../../config/logger");
const Option = require("../../models/option/Option");

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

module.exports = {
    _read,
    _create,
    _update,
};