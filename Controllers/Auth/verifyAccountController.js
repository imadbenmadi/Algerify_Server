require("dotenv").config();
const { Users, email_verification_tokens } = require("../../models/Database");

const handleVerifyAccount = async (req, res) => {
    try {
        const { Code, userId } = req.body;
        console.log(userId, Code);

        if (!Code || !userId) {
            return res.status(409).json({ error: "Missing Data" });
        }
        const verificationToken = await email_verification_tokens.findOne({
            userId: userId,
        });
        console.log(" verification token in database : ", verificationToken);
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

        // Update user's email verification status
        user.IsEmailVerified = true;
        await user.save();

        // Remove the verification token from the database
        await email_verification_tokens.deleteOne({
            _id: verificationToken._id,
        });

        res.status(200).json({ message: "Account Verified Successfully" });
    } catch (err) {
        res.status(400).json({
            error: "An error occurred while verifying the account",
        });
    }
};

module.exports = { handleVerifyAccount };
