const jwt = require("jsonwebtoken");
require("dotenv").config();
const { admins, Refresh_tokens } = require("../models/Database");

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
module.exports = { Dashboard_Login };
