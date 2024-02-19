const { Users, Stores, Products } = require("../models/Database");
require("dotenv").config();
const Verify_user = require("../Middleware/Verify_user");
const Verify_Admin = require("../Middleware/Verify_Admin");
const CommentProduct = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    try {
        const userId = req.body.userId;
        const productId = req.params.productId;
        const Comment = req.body.Comment;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const product_in_db = await Products.findById(productId);
        if (!product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        const Already_Commentd = product_in_db.Comments.some(
            (item) => item.user == userId
        );
        if (Already_Commentd) {
            return res
                .status(400)
                .json({ error: "user already Commentd this product." });
        }
        product_in_db.Comments.push({ user: userId, Comment: Comment });
        await product_in_db.save();
        return res.status(200).json({
            message: "Product Commentd successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const Delete_CommentProduct = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    try {
        const userId = req.body.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const product_in_db = await Products.findById(productId);
        if (!product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        const Already_Commentd = product_in_db.Comments.some(
            (item) => item.user == userId
        );
        if (!Already_Commentd) {
            return res
                .status(400)
                .json({ error: "user didn't Comment this product." });
        }
        const CommentIndex = product_in_db.Comments.findIndex(
            (item) => item.user == userId
        );
        product_in_db.Comments.splice(CommentIndex, 1);
        await product_in_db.save();
        return res.status(200).json({
            message: "Product Comment deleted successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const get_product_userComment = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    try {
        const userId = req.body.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const product_in_db = await Products.findById(productId);
        if (!product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        const userComment = product_in_db.Comments.find(
            (item) => item.user == userId
        );
        if (!userComment) {
            return res
                .status(404)
                .json({ error: "User didn't Comment this product." });
        }
        return res.status(200).json(userComment);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};

module.exports = {
    CommentProduct,
    Delete_CommentProduct,
    get_product_userComment,
};