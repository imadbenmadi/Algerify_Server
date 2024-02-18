const express = require("express");
const router = express.Router();
const ProductController = require("../Controllers/ProductController");
router.put("/:productId", ProductController.EditProduct);
router.get("/:productId", ProductController.getProduct);
router.get("/", ProductController.getAllProducts);
router.get("/category", ProductController.getAllCategorys);
router.get("/category/:category", ProductController.getProductByCategory);
router.delete("/:productId", ProductController.DeleteProduct);
router.post("/Create", ProductController.CreateProduct);
router.post("/RateProduct/:productId", UserController.RateProduct);
router.delete("/RateProduct/:userId", UserController.RateProduct);
router.post("/CommentProduct/:userId", UserController.CommentProduct);
router.delete("/CommentProduct/:userId", UserController.CommentProduct);
router.get("/getRate/:productId", ProductController.getRate);
router.get("/getComment/:productId", ProductController.getComment);

module.exports = router;
