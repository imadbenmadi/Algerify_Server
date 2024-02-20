const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");
const RateController = require("../Controllers/RateController");
const CommentController = require("../Controllers/CommentController");
// router.get("/", UserController.getAllUsers); // Only Admin
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

// userId through body 
router.post("/RateProduct/:productId", RateController.RateProduct);
router.delete("/RateProduct/:userId", RateController.Delete_RateProduct);
router.post("/CommentProduct/:userId", CommentController.CommentProduct);
router.delete(
    "/CommentProduct/:userId",
    CommentController.Delete_CommentProduct
);
router.get("/get_user_Rate/:productId", RateController.get_product_userRate);
router.get("/get_user_Comment/:productId", CommentController.get_product_userComment);

router.get("/get_user_Rate/:storeId", RateController.get_Store_userRate);
router.post("/RateStore/:userId", RateController.RateStore);
router.delete("/RateStore/:userId", RateController.Delete_RateStore);

router.post("/:userId/CreateStore", UserController.CreateStore);


module.exports = router;
