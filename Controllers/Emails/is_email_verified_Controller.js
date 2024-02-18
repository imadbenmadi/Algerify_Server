const { Users } = require("../../models/Database");

const handle_check = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(404).json({ error: "messing Data" });
        else {
            const isAuth = await Verify_user(req, res);
            if (isAuth.status == false)
                return res
                    .status(401)
                    .json({ error: "Unauthorized: Invalid token" });
            if (isAuth.status == true && isAuth.Refresh == true) {
                res.cookie("accessToken", isAuth.newAccessToken, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                    maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
                });
            }
        }
        const user = await Users.findById(userId).select("IsEmailVerified");
        if (!user) {
            return res.status(404).json({ error: "User Not Found" });
        }
        return res.status(200).json({ IsEmailVerified: user.IsEmailVerified });
    } catch (error) {
        return res.status(500).json({ error: "internal server Error" });
    }
};
module.exports = { handle_check };
