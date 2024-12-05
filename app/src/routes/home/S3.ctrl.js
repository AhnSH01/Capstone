"use strict";

const { log } = require("../../config/logger");
const S3 = require("../../models/S3/S3");

// Post 요청 처리
const _create = {
  upload: async (req, res) => {
    try {
      S3.upload(req);

      const url = {
        method: "Post",
        path: "/upload",
        status: 201,
      };
      const response = { msg : "스트리밍 처리 완료"};

      log(response, url);
      return res.status(url.status).json(response);
    } catch (error) {
      const url = {
        method: "Post",
        path: "/upload",
        status: 500,
      };
      const response = { msg : "스트리밍 처리 중 오류 발생:", error};

      log(response, url);
      return res.status(url.status).json(response);
    }
  },
};

module.exports = {
  // _read,
  _create,
  // _update,
};
