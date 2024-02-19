const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");
router.get("/", UserController.getAllUsers); // Only Admin
router.get("/Profile/:userId", UserController.getProfile); // Only Admin
router.get("/:userId", UserController.getUser); 

router.put("/:userId", UserController.EditProfile); 
router.delete("/:userId", UserController.DeleteProfile); // both Admin and User

router.post("/Basket/:productId", UserController.add_to_Basket);
router.delete("/Basket/:productId", UserController.delete_from_Basket);
router.get("/Basket/:userId", UserController.get_Basket);

router.post("/Favorit/:productId", UserController.add_to_Favorit);
router.delete("/Favorit/:productId", UserController.delete_from_Favorit);
router.get("/Favorit/:userId", UserController.get_Favorite);


router.post("/RateProduct/:productId", UserController.RateProduct);
router.delete("/RateProduct/:userId", UserController.RateProduct);
router.post("/CommentProduct/:userId", UserController.CommentProduct);
router.delete("/CommentProduct/:userId", UserController.CommentProduct);
router.get("/getRate/:productId", UserController.getRate);
router.get("/getComment/:productId", UserController.getComment);

router.get("/getRate/:storeId", UserController.getRate);
router.post("/RateStore/:userId", UserController.RateStore);
router.delete("/RateStore/:userId", UserController.RateStore);

router.post("/:userId/Create", UserController.CreateStore);


module.exports = router;
