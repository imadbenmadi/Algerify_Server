const express = require("express");
const router = express.Router();
const ProductController = require("../Controllers/ProductController");

router.get("/", ProductController.getAllProducts);
router.get("/:productId", ProductController.getProduct);
router.get("/categories", ProductController.getAllCategorys);
router.get("/categories/:category", ProductController.getProductByCategory);


router.post("/RateProduct/:productId", UserController.RateProduct);
router.delete("/RateProduct/:userId", UserController.RateProduct);
router.post("/CommentProduct/:userId", UserController.CommentProduct);
router.delete("/CommentProduct/:userId", UserController.CommentProduct);
router.get("/getRate/:productId", ProductController.getRate);
router.get("/getComment/:productId", ProductController.getComment);

module.exports = router;
