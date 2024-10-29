"use strict";

const express = require("express");
const router = express.Router();

const ctrl = require("./home.ctrl");

router.get("/", ctrl._read.home);
router.get("/login", ctrl._read.login);
router.get("/register", ctrl._read.register);
router.get("/accesstoken", ctrl._read.accesstoken);
router.get("/refreshtoken", ctrl._read.refreshtoken);
router.get("/user", ctrl._read.user);
// router.get("/login/success", ctrl._read.loginSuccess);

router.post("/login", ctrl._create.login);
router.post("/logout", ctrl._create.logout);
router.post("/register", ctrl._create.register);

router.patch("/user/password", ctrl._update.password);
router.patch("/user/name", ctrl._update.name);
router.patch("/user/adress", ctrl._update.adress);
router.patch("/user/phone_number", ctrl._update.phone_number);
router.patch("/user/gender", ctrl._update.gender);
router.patch("/user/age", ctrl._update.age);

module.exports = router;