const { Users } = require("../../models/Database");
const Verify_user = require("../../Middleware/Verify_user");

const handle_check = async (req, res) => {
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
        if (req.params.userId !== isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorised" });
        }
        const userId = req.params.userId;
        if (!userId) return res
            .status(409)
            .json({
                error: "Messing Data, required fields: userId: params",
            });
        const user = await Users.findById(userId).select("IsEmailVerified");
        if (!user) {
            return res.status(404).json({ error: "User Not Found" });
        }
        return res.status(200).json({ IsEmailVerified: user.IsEmailVerified });
    } catch (error) {
        return res.status(500).json({ error });
    }
};
module.exports = { handle_check };
