"use strict";

// 모듈
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
dotenv.config();

// 라우팅
const home = require("./src/routes/home");

app.set("views", "./app/src/views");
app.set("view engine", "ejs");
app.use(express.static(`${__dirname}/src/public`));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    Credentials: true,
}));

// URL을 통해 전달되는 데이터에 한글, 공백 등과 같은 문자가 포함될 경우 제대로 인식되지 않는 문제 해결
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", home);

module.exports = app;