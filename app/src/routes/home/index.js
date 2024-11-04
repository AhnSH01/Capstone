"use strict";

const express = require("express");
const router = express.Router();

const ctrl = require("./home.ctrl");

router.get("/", ctrl._read.home); // 홈페이지 테스트용
router.get("/login", ctrl._read.login); // 로그인 테스트용
router.get("/register", ctrl._read.register); // 회원가입 테스트용
router.get("/updatePassword", ctrl._read.updatePassword); // 비밀번호 변경 테스트용
router.get("/updateUser", ctrl._read.updateUser); // 유저정보 변경 테스트용
router.get("/accesstoken", ctrl._read.accesstoken); // 액세스토큰 검증 후 정보 반환
router.get("/refreshtoken", ctrl._read.refreshtoken); // 리프레쉬토큰 검증 후 정보 반환
router.get("/user", ctrl._read.user); // user 정보 반환 (password 제외) => 프로필 정보용

router.post("/login", ctrl._create.login); // 로그인
router.post("/logout", ctrl._create.logout); // 로그아웃 (필요없음)
router.post("/register", ctrl._create.register); // 회원가입

router.patch("/user/password", ctrl._update.password); // 비밀번호 변경
router.patch("/user", ctrl._update.user); // 유저정보 변경

module.exports = router;