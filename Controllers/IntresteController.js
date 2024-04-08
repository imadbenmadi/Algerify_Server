const {
    Users,
    Stores,
    Products,
    Refresh_tokens,
    email_verification_tokens,
    UserActions,
} = require("../models/Database");
require("dotenv").config();
const Verify_user = require("../Middleware/Verify_user");
const Verify_user = require("../Middleware/Verify_user");

const add_to_intrested_products = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (!isAuth.status)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status && isAuth.Refresh) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000,
        });
    }
    try {
        if (req.params.userId !== isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorised" });
        }
        const userId = req.params.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db)
            return res.status(404).json({ error: "User not found." });
        const productExists = user_in_db.intrested_products.some(
            (item) => item.ProductId == productId
        );
        if (productExists)
            return res
                .status(400)
                .json({ error: "Product already in intrested products." });
        const notInterestedProductIndex =
            user_in_db.not_intrested_products.findIndex(
                (item) => item.ProductId == productId
            );
        if (notInterestedProductIndex !== -1) {
            user_in_db.not_intrested_products.splice(
                notInterestedProductIndex,
                1
            );
        }
        user_in_db.intrested_products.push({ ProductId: productId });
        await user_in_db.save();
        const userActions = await UserActions.findOne({ userId: userId });
        if (userActions) {
            userActions.interesting_Products.push({
                productId: productId,
                time: new Date(),
            });
            await userActions.save();
        }
        return res.status(200).json({
            message: "Product added to intrested products successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
};

const delete_from_intrested_products = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (!isAuth.status)
        return res.status(401).json({
            error: "Unauthorized: Invalid token",
        });
    if (isAuth.status && isAuth.Refresh) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000,
        });
    }
    try {
        if (req.params.userId !== isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorised" });
        }
        const userId = req.params.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db)
            return res.status(404).json({ error: "User not found." });
        const productIndex = user_in_db.intrested_products.findIndex((item) => {
            return item.ProductId == productId;
        });
        if (productIndex == -1)
            return res.status(404).json({
                error: "Product not found in user's intrested products.",
            });
        user_in_db.intrested_products.splice(productIndex, 1);
        await user_in_db.save();
        return res.status(200).json({
            message: "Product deleted from intrested products successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};

const add_to_not_intrested_products = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (!isAuth.status)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status && isAuth.Refresh) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000,
        });
    }
    try {
        if (req.params.userId !== isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorised" });
        }
        const userId = req.params.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Missing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db)
            return res.status(404).json({ error: "User not found." });

        const productExists = user_in_db.not_intrested_products.some(
            (item) => item.ProductId == productId
        );
        if (productExists)
            return res
                .status(400)
                .json({ error: "Product already in not interested products." });
        const intrestedProductIndex = user_in_db.intrested_products.findIndex(
            (item) => String(item.ProductId) === productId
        );
        if (intrestedProductIndex !== -1) {
            user_in_db.intrested_products.splice(intrestedProductIndex, 1);
        }
        user_in_db.not_intrested_products.push({ ProductId: productId });
        await user_in_db.save();
        return res.status(200).json({
            message: "Product added to not interested products successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
};

const delete_from_not_intrested_products = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (!isAuth.status)
        return res.status(401).json({
            error: "Unauthorized: Invalid token",
        });
    if (isAuth.status && isAuth.Refresh) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000,
        });
    }
    try {
        if (req.params.userId !== isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorised" });
        }
        const userId = req.params.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Missing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db)
            return res.status(404).json({ error: "User not found." });
        const productIndex = user_in_db.not_intrested_products.findIndex(
            (item) => {
                return item.ProductId == productId;
            }
        );
        if (productIndex == -1)
            return res.status(404).json({
                error: "Product not found in user's not interested products.",
            });
        user_in_db.not_intrested_products.splice(productIndex, 1);
        await user_in_db.save();
        return res.status(200).json({
            message:
                "Product deleted from not interested products successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};

module.exports = {
    add_to_intrested_products,
    delete_from_intrested_products,
    add_to_not_intrested_products,
    delete_from_not_intrested_products,
};
