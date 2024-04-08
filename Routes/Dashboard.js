const express = require("express");
const router = express.Router();
const Dashboard_Controller = require("../Controllers/Dashboard_Controller");

router.post("/Login", Dashboard_Controller.Dashboard_Login);
// router.get("/categories", Dashboard_Controller.getAllCategorys);
// router.get("/categories/:category", Dashboard_Controller.getProductByCategory);
// router.get("/filter", Dashboard_Controller.FilterProducts);
// router.get("/search/:search", Dashboard_Controller.searchProduct);
// router.get("/:productId", Dashboard_Controller.getProduct);
module.exports = router;
