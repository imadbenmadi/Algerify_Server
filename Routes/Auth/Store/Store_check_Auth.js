const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Stores, Refresh_tokens } = require("../../../models/Database");

router.get("/", async (req, res) => {
    const accessToken = req.cookies.admin_accessToken;
    const refreshToken = req.cookies.admin_refreshToken;

    try {
        // Verify the access token
        jwt.verify(
            accessToken,
            process.env.ADMIN_ACCESS_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) {
                    if (err.name === "TokenExpiredError") {
                        // Access token expired, attempt to refresh it
                        try {
                            if (!refreshToken) {
                                return res.status(401).json({
                                    error: "Unauthorized",
                                });
                            }

                            const found_in_DB = await Refresh_tokens.findOne({
                                token: refreshToken,
                            }).exec();

                            if (!found_in_DB) {
                                return res.status(401).json({
                                    error: "Unauthorized ",
                                });
                            }

                            jwt.verify(
                                refreshToken,
                                process.env.REFRESH_TOKEN_SECRET,
                                async (err, decoded) => {
                                    if (err) {
                                        return res.status(401).json({
                                            error: "Unauthorized ",
                                        });
                                    } else if (
                                        found_in_DB.userId != decoded.userId
                                    ) {
                                        return res.status(401).json({
                                            error: "Unauthorized ",
                                        });
                                    }

                                    // Generate new access token
                                    const newAccessToken = jwt.sign(
                                        { userId: decoded.userId },
                                        process.env.ACCESS_TOKEN_SECRET,
                                        { expiresIn: "1h" }
                                    );
                                    res.cookie(
                                        "admin_accessToken",
                                        newAccessToken,
                                        {
                                            httpOnly: true,
                                            sameSite: "None",
                                            secure: true,
                                            maxAge: 60 * 60 * 1000,
                                        }
                                    );
                                    const user = await Stores.findOne({
                                        _id: decoded.userId,
                                    });

                                    return res.status(200).json({
                                        message:
                                            "Access token refreshed successfully",
                                    });
                                }
                            );
                        } catch (refreshErr) {
                            return res.status(500).json({ error: refreshErr });
                        }
                    } else {
                        return res.status(401).json({
                            error: "Unauthorized ",
                        });
                    }
                } else {
                    const user = await Stores.findOne({ _id: decoded.userId });
                    return res.status(200).json({
                        message: "Access token is valid",
                    });
                }
            }
        );
    } catch (err) {
        return res.status(500).json({ error: err });
    }
});

module.exports = router;
