const express = require("express");
const router = express.Router();
const ProductController = require("../Controllers/ProductController");

router.get("/", ProductController.getAllProducts);
router.get("/:productId", ProductController.getProduct);
router.get("/categories", ProductController.getAllCategorys);
router.get("/categories/:category", ProductController.getProductByCategory);

module.exports = router;
