require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Refresh_tokens } = require("../models/Database");

const Verify_Admin = async (req, res) => {
    const secretKey = process.env.ADMIN_ACCESS_TOKEN_SECRET;
    const accessToken = req.cookies.admin_accessToken;
    const refreshToken = req.cookies.admin_refreshToken;

    try {
        const decoded = jwt.verify(accessToken, secretKey);
        return { status: true, Refresh: false };
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            // Token expired, attempt to refresh it
            try {
                if (!refreshToken) {
                    console.error("Refresh token is missing.");
                    return { status: false, Refresh: false };
                }

                const found_in_DB = await Refresh_tokens.findOne({
                    token: refreshToken,
                }).exec();

                if (!found_in_DB) {
                    console.error("Refresh token not found in the database.");
                    return { status: false, Refresh: false };
                }

                return new Promise((resolve, reject) => {
                    jwt.verify(
                        refreshToken,
                        process.env.ADMIN_REFRESH_TOKEN_SECRET,
                        async (err, decoded) => {
                            if (err) {
                                console.error(
                                    "Failed to verify JWT. Refresh token does not match.",
                                    err
                                );
                                resolve({ status: false, Refresh: false });
                            } else {
                                // Generate new access token
                                const newAccessToken = jwt.sign(
                                    { userId: decoded.userId },
                                    process.env.ADMIN_ACCESS_TOKEN_SECRET,
                                    { expiresIn: "5m" }
                                );

                                console.log("Token refreshed");
                                resolve({
                                    status: true,
                                    Refresh: true,
                                    newAccessToken,
                                });
                            }
                        }
                    );
                });
            } catch (refreshErr) {
                console.error("Error refreshing token:", refreshErr);
                return { status: false, Refresh: false };
            }
        } else {
            // Other verification error, return false
            console.error("Error verifying token:", err);
            return { status: false, Refresh: false };
        }
    }
};

module.exports = Verify_Admin;
