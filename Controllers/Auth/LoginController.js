const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Users, Refresh_tokens } = require("../../models/Database");

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
        const user = await Users.findOne({ Email: Email });
        if (user && user.Password === Password) {
            const accessToken = jwt.sign(
                { userId: user._id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "1h" }
            );
            const refreshToken = jwt.sign(
                { userId: user._id },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: "1d" }
            );

            try {
                await Refresh_tokens.create({
                    userId: user._id,
                    token: refreshToken,
                });
            } catch (err) {
                res.status(500).json({
                    error: "Internal Server Error " + err.message,
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
                maxAge: 24 * 60 * 60 * 1000,
            });
            if (req.cookies.admin_accessToken) {
                res.clearCookie("admin_accessToken");
            }
            if (req.cookies.admin_refreshToken) {
                res.clearCookie("admin_refreshToken");
            }
            const today = new Date();
            const lastMonth = new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                today.getDate()
            );
            // Filter notifications that are unread or from the last month
            const notificationsToSend = user.Notifications.filter(
                (notification) => {
                    // Include notification if it's unread or from the last month
                    return (
                        !notification.Readed || notification.Date >= lastMonth
                    );
                }
            );
            const UserData_To_Send = {
                _id: user._id,
                Email: user.Email,
                FirstName: user.FirstName,
                LastName: user.LastName,
                Notifications: notificationsToSend,
                ProfilePic: user.ProfilePic,
                Address: user.Address,
                basket: user.basket,
                Favorite : user.Favorite,
                IsEmailVerified: user.IsEmailVerified,
            };
            res.status(200).json({
                message: "Logged In Successfully",
                userData: UserData_To_Send,
                jwt: accessToken,
            });
        } else {
            res.status(401).json({
                error: "Username or Password isn't correct",
            });
        }
    } catch (err) {
        res.status(400).json({ error: err });
    }
};
module.exports = { handleLogin };