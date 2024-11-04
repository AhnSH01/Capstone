"use strict";

const express = require("express");
const router = express.Router();

const ctrl = require("./home.ctrl");

router.get("/", ctrl._read.home);
router.get("/login", ctrl._read.login);
router.get("/register", ctrl._read.register);
router.get("/updatePassword", ctrl._read.updatePassword);
router.get("/accesstoken", ctrl._read.accesstoken);
router.get("/refreshtoken", ctrl._read.refreshtoken);
router.get("/user", ctrl._read.user);
// router.get("/login/success", ctrl._read.loginSuccess);

router.post("/login", ctrl._create.login);
router.post("/logout", ctrl._create.logout);
router.post("/register", ctrl._create.register);

router.patch("/user/password", ctrl._update.password);
router.patch("/user", ctrl._update.user);

module.exports = router;