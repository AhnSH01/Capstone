"use strict";

const logger = require("../../config/logger");
const Option = require("../../models/option/Option");

// log 처리
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
            status: response.error !== undefined ? 409 : 201,
        };

        log(response, url);
        return res.status(url.status).json(response);
    },
};

// Delete 요청 처리 필요없을듯
// const _delete = {
//     options: async (req, res) => {
//     },
// };

module.exports = {
    _read,
    _create,
    _update,
    // _delete,
};