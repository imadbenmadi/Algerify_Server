const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");
router.get("/", UserController.getAllUsers); // Only Admin
router.get("/Profile/:userId", UserController.getProfile); // Only Admin
router.get("/:userId", UserController.getUser); 

router.put("/:userId", UserController.EditProfile); 
router.delete("/:userId", UserController.DeleteProfile); // both Admin and User
router.post("/Create", UserController.CreateUser); // Only Admin

router.post("/Basket/:productId", UserController.add_to_Basket);
router.delete("/Basket/:productId", UserController.delete_from_Basket);
router.get("/Basket/:userId", UserController.get_Basket);

router.post("/Favorit/:productId", UserController.add_to_Favorit);
router.delete("/Favorit/:productId", UserController.delete_from_Favorit);
router.get("/Favorit/:userId", UserController.get_Favorit);
module.exports = router;
