const { Users } = require("../../models/Database");

const handle_check = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(404).json({ error: "messing Data" });
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
