const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");
const RateController = require("../Controllers/RateController");
const CommentController = require("../Controllers/CommentController");
const IntresteController = require("../Controllers/IntresteController");
router.get("/", UserController.getAllUsers); // Only Admin
router.get("/:userId/Profile", UserController.getProfile); // Only Admin
router.get("/:userId", UserController.getUser);
router.put("/:userId", UserController.EditProfile);
router.delete("/:userId", UserController.DeleteProfile); // both Admin and User

router.post("/:userId/CreateStore", UserController.CreateStore);
router.post("/:userId/Follow/:storeId", UserController.Follow_Store);
router.post("/:userId/Unfollow/:storeId", UserController.Unfollow_Store);
router.post("/:userId/Basket/:productId", UserController.add_to_Basket);
router.delete("/:userId/Basket/:productId", UserController.delete_from_Basket);
router.get("/:userId/Basket", UserController.get_Basket);

router.post("/:userId/Favorite/:productId", UserController.add_to_Favorit);
router.delete(
    "/:userId/Favorite/:productId",
    UserController.delete_from_Favorit
);
router.get("/:userId/Favorite", UserController.get_Favorite);
router.post("/:userId/RateProduct/:productId", RateController.RateProduct);
router.delete(
    "/:userId/RateProduct/:productId",
    RateController.Delete_RateProduct
);
router.put("/:userId/RateProduct/:productId", RateController.Edit_RateProduct);
router.get(
    "/:userId/RateProduct/:productId",
    RateController.get_product_userRate
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
    "/:userId/CommentProduct/:productId",
    CommentController.get_product_userComment
);
router.put(
    "/:userId/CommentProduct/:productId",
    CommentController.Etid_Comment
);
// -------------------------------------

router.post("/:userId/RateStore/:storeId", RateController.RateStore);
router.delete("/:userId/RateStore/:storeId", RateController.Delete_RateStore);
router.put("/:userId/RateStore/:storeId", RateController.Edit_RateStore);
router.get("/:userId/RateStore/:storeId", RateController.get_Store_userRate);

router.post(
    "/:userId/Intrested/:productId",
    IntresteController.add_to_intrested_products
);
router.delete(
    "/:userId/Intrested/:productId",
    IntresteController.delete_from_intrested_products
);
router.post("/:userId/Not_Intrested/:productId", IntresteController.add_to_not_intrested_products);
router.delete("/:userId/Not_Intrested/:productId", IntresteController.delete_from_not_intrested_products);
module.exports = router;
