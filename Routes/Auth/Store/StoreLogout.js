const express = require("express");
const router = express.Router();
const StorelogoutController = require("../../Controllers/Auth/Store/StoreLogoutController");

router.post("/", StorelogoutController.handleLogout);

module.exports = router;
