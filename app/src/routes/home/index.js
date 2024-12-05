"use strict";

const express = require("express");
const router = express.Router();

const userCtrl = require("./user.ctrl");
const optionCtrl = require("./option.ctrl");
const videoCtrl = require("./video.ctrl");
const S3Ctrl = require("./S3.ctrl");

// user 관련 API
// id, login_id, password, address, name, phone_number, gender, age
router.get("/", userCtrl._read.home); // 홈페이지 테스트용
router.get("/login", userCtrl._read.login); // 로그인 테스트용
router.get("/register", userCtrl._read.register); // 회원가입 테스트용
router.get("/updatePassword", userCtrl._read.updatePassword); // 비밀번호 변경 테스트용
router.get("/updateUser", userCtrl._read.updateUser); // 유저정보 변경 테스트용
router.get("/accesstoken", userCtrl._read.accesstoken); // 액세스토큰 검증 후 정보 반환
router.get("/refreshtoken", userCtrl._read.refreshtoken); // 리프레쉬토큰 검증 후 정보 반환
router.get("/user", userCtrl._read.user); // user 정보 반환 (password 제외) => 프로필 정보용

router.post("/login", userCtrl._create.login); // 로그인
router.post("/logout", userCtrl._create.logout); // 로그아웃 (필요없음)
router.post("/register", userCtrl._create.register); // 회원가입

router.patch("/user/password", userCtrl._update.password); // 비밀번호 변경
router.patch("/user", userCtrl._update.user); // 유저정보 변경

router.delete("/user", userCtrl._delete.user); // 유저정보 삭제 (탈퇴)


// options 관련 API
// user_id, push, theme, language
router.get("/option", optionCtrl._read.option); // options 정보 반환

router.post("/option", optionCtrl._create.option); // options 정보 생성

router.patch("/option", optionCtrl._update.option); // options 정보 변경

// router.delete("/option", optionCtrl._delete.option); // options 정보 삭제
// options 테이블 user_id가 user의 id 참조하고 있고 설정에서 외래키 삭제시 같이 삭제해놔서 필요없을듯


// video 관련 API
// id, user_id, date, S3_URL
router.get("/video", videoCtrl._read.video); // 모든 video 정보 반환
router.get("/video/date", videoCtrl._read.videoByDate); // 특정 날짜의 video 정보 반환

router.post("/video", videoCtrl._create.video); // video 정보 생성

router.patch("/video", videoCtrl._update.video); // video 정보 변경

router.delete("/video", videoCtrl._delete.video); // video 정보 삭제

// S3 관련 API
router.post('/upload', express.raw({type: 'application/octet-stream', limit: '10mb'}, S3Ctrl._create.upload));

module.exports = router;