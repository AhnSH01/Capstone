"use strict";

const express = require("express");
const router = express.Router();

const ctrl = require("./home.ctrl");

router.get("/", ctrl.output.home);
router.get("/login", ctrl.output.login);
router.get("/register", ctrl.output.register);
router.get("/accesstoken", ctrl.output.accesstoken);
router.get("/refreshtoken", ctrl.output.refreshtoken);
// router.get("/login/success", ctrl.output.loginSuccess);

router.post("/login", ctrl.process.login);
router.post("/logout", ctrl.process.logout);
router.post("/register", ctrl.process.register);

module.exports = router;