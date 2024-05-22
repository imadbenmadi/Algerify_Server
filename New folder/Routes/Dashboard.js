const express = require("express");
const router = express.Router();
const Dashboard_Controller = require("../Controllers/Dashboard_Controller");

router.post("/Login", Dashboard_Controller.Dashboard_Login);
router.post("/Category", Dashboard_Controller.add_category);
router.delete("/Category", Dashboard_Controller.delete_category);
module.exports = router;
