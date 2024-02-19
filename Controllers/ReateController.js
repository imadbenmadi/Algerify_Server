const { Users, Stores, Products } = require("../models/Database");
require("dotenv").config();
const Verify_user = require("../Middleware/Verify_user");
const Verify_Admin = require("../Middleware/Verify_Admin");
const RateProduct = async (req, res) => {
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
        const rate = req.body.rate;
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
        const Already_Rated = product_in_db.Ratings.some(
            (item) => item.user == userId
        );
        if (Already_Rated) {
            return res
                .status(400)
                .json({ error: "You already rated this product." });
        }
        product_in_db.Ratings.push({ user: userId, rate: rate });
        await product_in_db.save();
        return res.status(200).json({
            message: "Product rated successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const Delete_RateProduct = async (req, res) => {
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
        const Already_Rated = product_in_db.Ratings.some(
            (item) => item.user == userId
        );
        if (!Already_Rated) {
            return res
                .status(400).json({ error: "You didn't rate this product." });
        }
        const rateIndex = product_in_db.Ratings.findIndex(
            (item) => item.user == userId
        );
        product_in_db.Ratings.splice(rateIndex, 1);
        await product_in_db.save();
        return res.status(200).json({
            message: "Product rate deleted successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const get_product_userRate = async (req, res) => {
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
        const userRate = product_in_db.Ratings.find(
            (item) => item.user == userId
        );
        if (!userRate) {
            return res.status(404).json({ error: "User didn't rate this product." });
        }
        return res.status(200).json(userRate);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
}

module.exports = {
    RateProduct,
    Delete_RateProduct,
    get_product_userRate,
};
