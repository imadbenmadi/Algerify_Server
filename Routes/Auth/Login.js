const express = require("express");
const router = express.Router();
const LoginController = require("../../Controllers/Auth/LoginController");

router.post("/", (req, res) => {
    LoginController.handleLogin(req, res);
});

module.exports = router;
