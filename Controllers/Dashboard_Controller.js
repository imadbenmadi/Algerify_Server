const jwt = require("jsonwebtoken");
require("dotenv").config();
const { admins, Categories, Refresh_tokens } = require("../models/Database");
const Dashboard_middleware = require("../Middleware/Dashboard_middleware")
const Dashboard_Login = async (req, res) => {
    try {
        const { Name, Password } = req.body;
        if (!Name || !Password) {
            return res.status(409).json({ error: "Missing Data" });
        } else if (Password.length < 8) {
            return res.status(409).json({
                error: "Password must be at least 8 characters",
            });
        }
        const admin = await admins.findOne({ Name: Name });
        if (admin && admin.Password === Password) {
            const accessToken = jwt.sign(
                { userId: admin._id },
                process.env.ADMIN_ACCESS_TOKEN_SECRET,
                { expiresIn: "1h" }
            );
            const refreshToken = jwt.sign(
                { userId: admin._id },
                process.env.ADMIN_REFRESH_TOKEN_SECRET,
                { expiresIn: "7d" }
            );

            try {
                await Refresh_tokens.create({
                    userId: admin._id,
                    token: refreshToken,
                });
            } catch (err) {
                return res.status(500).json({
                    error: err,
                });
            }
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 60 * 60 * 1000,
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return res.status(200).json({
                message: "Logged In Successfully",
            });
        } else {
            return res.status(401).json({
                error: "admin name or Password isn't correct",
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err });
    }
};

const add_category = async (req, res) => {
    const isAuth = await Dashboard_middleware(req, res);
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
    const { Category } = req.body;
    if (!Category) {
        return res.status(400).json({ error: "Missing Category data" });
    }
    try {
        const existingCategory = await Categories.findOne({ Category });
        if (existingCategory) {
            return res.status(409).json({ error: "Category already exists" });
        }
        await Categories.create({ Category });
        return res.status(200).json({ message: "Category added successfully" });
    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
const delete_category = async (req, res) => {
    const isAuth = await Dashboard_middleware(req, res);
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
    const { Category } = req.body;
    if (!Category) {
        return res.status(400).json({ error: "Missing Category data" });
    }
    try {
        const existingCategory = await Categories.findOne({ Category });
        if (!existingCategory) {
            return res.status(404).json({ error: "Category not found" }); 
        }
        await Categories.deleteOne({ Category });
        return res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { Dashboard_Login, add_category, delete_category };
