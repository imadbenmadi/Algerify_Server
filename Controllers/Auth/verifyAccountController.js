require("dotenv").config();
const { Users, email_verification_tokens } = require("../../models/Database");

const handleVerifyAccount = async (req, res) => {
    try {
        const { Code, userId } = req.body;
        if (!Code || !userId) {
            return res.status(409).json({ error: "Missing Data" });
        }
        const verificationToken = await email_verification_tokens.findOne({
            userId: userId,
        });
        if (!verificationToken.token) {
            return res
                .status(404)
                .json({ error: "Verification token not found" });
        }

        if (verificationToken.token != Code) {
            return res.status(409).json({ error: "Invalid verification code" });
        }
        if (verificationToken.expire < new Date()) {
            return res
                .status(409)
                .json({ error: "Verification token has expired" });
        }

        const user = await Users.findById(verificationToken.userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.IsEmailVerified = true;
        await user.save();
        await email_verification_tokens.deleteOne({
            _id: verificationToken._id,
        });

      return res.status(200).json({ message: "Account Verified Successfully" });
    } catch (error) {
      return res.status(500).json({ error });
    }
};

module.exports = { handleVerifyAccount };
