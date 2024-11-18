"use strict";

const { log } = require("../../config/logger");
const Video = require("../../models/video/Video");

// Get 요청 처리
const _read = {
    video: async (req, res) => {
        const video = new Video(req.query);
        const response = await video.getVideo();

        const url = {
            method: "GET",
            path: "/video",
            status: response.error ? 409 : 201,
        };

        log(response, url);
        return res.json(response);
    },
    videoByDate: async (req, res) => {
        const video = new Video(req.query);
        const response = await video.getVideoByDate();

        const url = {
            method: "GET",
            path: "/video/date",
            status: response.error ? 409 : 201,
        };

        log(response, url);
        return res.json(response);
    },
};

// Post 요청 처리
const _create = {
    video: async (req, res) => {
        const video = new Video(req.body);
        const response = await video.createVideo();

        const url = {
            method: "POST",
            path: "/video",
            status: response.error ? 409 : 201,
        };

        log(response, url);
        return res.status(url.status).json(response);
    },
};

// Patch 요청 처리
const _update = {
    video: async (req, res) => {
        const video = new Video(req.body);
        const response = await video.updateVideo();

        const url = {
            method: "Patch",
            path: "/video",
            status: response.error ? 409 : 201,
        };

        log(response, url);
        return res.status(url.status).json(response);
    },
};

// Delete 요청 처리
const _delete = {
    video: async (req, res) => {
        const video = new Video(req.body);
        const response = await video.deleteVideo();

        const url = {
            method: "Delete",
            path: "/video",
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