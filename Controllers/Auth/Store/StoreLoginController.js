const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Stores, Refresh_tokens } = require("../../../models/Database");

const handleLogin = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        if (!Email || !Password) {
            return res.status(409).json({ error: "Missing Data" });
        } else if (Password.length < 8) {
            return res.status(409).json({
                error: "Password must be at least 8 characters",
            });
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(Email)) {
            return res.status(409).json({ error: "Invalid Email" });
        }
        const Store = await Stores.findOne({ Email: Email });
        if (Store && Store.Password === Password) {
            const accessToken = jwt.sign(
                { StoreId: Store._id },
                process.env.ADMIN_ACCESS_TOKEN_SECRET,
                { expiresIn: "1h" }
            );
            const refreshToken = jwt.sign(
                { StoreId: Store._id },
                process.env.ADMIN_REFRESH_TOKEN_SECRET,
                { expiresIn: "1d" }
            );

            try {
                await Refresh_tokens.create({
                    userId: Store._id,
                    token: refreshToken,
                });
            } catch (err) {
                return res.status(500).json({
                    error: err,
                });
            }
            res.cookie("admin_accessToken", accessToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 60 * 60 * 1000,
            });
            res.cookie("admin_refreshToken", refreshToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 24 * 60 * 60 * 1000,
            });
            if (req.cookies.accessToken) {
                res.clearCookie("accessToken");
            }
            if (req.cookies.refreshToken) {
                res.clearCookie("refreshToken");
            }
            const today = new Date();
            const lastMonth = new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                today.getDate()
            );

            const StoreData_To_Send = {
                _id: Store._id,
                Email: Store.Email,
                StoreName: Store.StoreName,
                Store_Describtion: Store.Store_Describtion,
                Telephone: Store.Telephone,
                Store_Image: Store.Store_Image,
                Store_Ratings: Store.Store_Ratings,
                Store_RatingAverage: Store.Store_RatingAverage,
                storeProducts: Store.storeProducts,
            };
            return res.status(200).json({
                message: "Logged In to store Successfully",
                StoreData: StoreData_To_Send,
            });
        } else {
            return res.status(401).json({
                error: "Store email or Password isn't correct",
            });
        }
    } catch (err) {
        return res.status(500).json({ err });
    }
};
module.exports = { handleLogin };
