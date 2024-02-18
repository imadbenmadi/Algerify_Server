const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");
router.put("/:userId", UserController.EditProfile); 
router.get("/:userId", UserController.getProfile); 
router.get("/", UserController.getAllUsers); // Only Admin
router.delete("/:userId", UserController.DeleteProfile); // both Admin and User
router.post("/Create", UserController.CreateUser); // Only Admin

router.post("/Basket/:userId", UserController.add_to_Basket);
router.delete("/Basket/:userId", UserController.delete_from_Basket);
router.get("/Basket/:userId", UserController.get_Basket);

router.post("/Favorit/:userId", UserController.add_to_Favorit);
router.delete("/Favorit/:userId", UserController.delete_from_Favorit);
router.get("/Favorit/:userId", UserController.get_Favorit);
module.exports = router;
