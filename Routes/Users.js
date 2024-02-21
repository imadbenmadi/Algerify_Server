const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");
const RateController = require("../Controllers/RateController");
const CommentController = require("../Controllers/CommentController");
router.get("/", UserController.getAllUsers); // Only Admin
router.get("/:userId/Profile", UserController.getProfile); // Only Admin
router.get("/:userId", UserController.getUser);
router.post("/:userId/CreateStore", UserController.CreateStore);

router.put("/:userId", UserController.EditProfile);
router.delete("/:userId", UserController.DeleteProfile); // both Admin and User

router.post("/:userId/Basket/:productId", UserController.add_to_Basket);
router.delete("/:userId/Basket/:productId", UserController.delete_from_Basket);
router.get("/:userId/Basket", UserController.get_Basket);
router.post("/:userId/Favorit/:productId", UserController.add_to_Favorit);
router.delete(
    "/:userId/Favorit/:productId",
    UserController.delete_from_Favorit
);
router.get("/:userId/Favorit", UserController.get_Favorite);
router.post("/:userId/RateProduct/:productId", RateController.RateProduct);
router.delete(
    "/:userId/RateProduct/:productId",
    RateController.Delete_RateProduct
);
router.post(
    "/:userId/CommentProduct/:productId",
    CommentController.CommentProduct
);
router.delete(
    "/:userId/CommentProduct/:productId",
    CommentController.Delete_CommentProduct
);
router.get(
    "/:userId/get_user_Rate/:productId",
    RateController.get_product_userRate
);
router.get(
    "/:userId/get_user_Comment/:productId",
    CommentController.get_product_userComment
);

router.get(
    "/:userId/get_user_Rate/:storeId",
    RateController.get_Store_userRate
);
router.post("/:userId/RateStore/:userId", RateController.RateStore);
router.delete("/:userId/RateStore/:userId", RateController.Delete_RateStore);


module.exports = router;
