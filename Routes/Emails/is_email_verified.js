const express = require("express");
const router = express.Router();
const is_email_verified_Controller = require("../../Controllers/Emails/is_email_verified_Controller");

router.get("/:userId", is_email_verified_Controller.handle_check);

module.exports = router;
