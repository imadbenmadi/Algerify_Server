require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Refresh_tokens } = require("../models/Database");

const Verify_Admin = async (req, res) => {
    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    try {
        const decoded = jwt.verify(accessToken, secretKey);
        return { status: true, Refresh: false, decoded };
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            // Token expired, attempt to refresh it
            try {
                if (!refreshToken) {
                    return { status: false, Refresh: false, decoded };
                }

                const found_in_DB = await Refresh_tokens.findOne({
                    token: refreshToken,
                }).exec();

                if (!found_in_DB) {
                    return { status: false, Refresh: false, decoded };
                }

                return new Promise((resolve, reject) => {
                    jwt.verify(
                        refreshToken,
                        process.env.REFRESH_TOKEN_SECRET,
                        async (err, decoded) => {
                            if (err) {
                                resolve({
                                    status: false,
                                    Refresh: false,
                                    decoded,
                                });
                            } else if (found_in_DB.userId != decoded._id) {
                                resolve({
                                    status: false,
                                    Refresh: false,
                                    decoded: null,
                                });
                            } else {
                                // Generate new access token
                                const newAccessToken = jwt.sign(
                                    { userId: decoded.userId },
                                    process.env.ACCESS_TOKEN_SECRET,
                                    { expiresIn: "5m" }
                                );

                                resolve({
                                    status: true,
                                    Refresh: true,
                                    newAccessToken,
                                    decoded,
                                });
                            }
                        }
                    );
                });
            } catch (refreshErr) {
                return { status: false, Refresh: false, decoded };
            }
        } else {
            // Other verification error, return false
            return { status: false, Refresh: false,decoded: null };
        }
    }
};

module.exports = Verify_Admin;
