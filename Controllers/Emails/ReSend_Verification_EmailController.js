const { Users, email_verification_tokens } = require("../../models/Database");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Verify_user = require("../../Middleware/Verify_user");
require("dotenv").config();

const generateVerificationCode = () => {
    const code = crypto.randomInt(100000, 999999);
    return code.toString();
};

const sendVerificationEmail = (Email, verificationToken) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL, // Your Gmail email address
            pass: process.env.PASSWORD, // Your Gmail password
        },
    });
    const htmlTemplate = `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f5f5f5;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        padding: 20px;
                        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #333333;
                        text-align: center;
                    }
                    p {
                        color: #666666;
                    }
                    .verification-code {
                        background-color: #f2f2f2;
                        padding: 10px;
                        border-radius: 5px;
                        text-align: center;
                        font-size: 20px;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Verification Email</h1>
                    <p>Please use the following verification code to Verify Your Account:</p>
                    <div class="verification-code">${verificationToken}</div>
                </div>
            </body>
        </html>
    `;
    transporter.sendMail(
        {
            from: process.env.EMAIL,
            to: Email,
            subject: "Skate Email verification",
            html: htmlTemplate,
        },
        (err, info) => {
            if (err) {
                return;
            }
        }
    );
};

const handle_send_Email = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
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
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(409).json({ message: "Missing Data" });
        }
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        } else if (user.IsEmailVerified) {
            return res.status(401).json({ error: "Email Already Verified" });
        }
        try {
            await email_verification_tokens.deleteMany({ userId: userId });
        } catch (error) {
          return res.status(500).json({ error });
        }

        const verificationToken = generateVerificationCode();
        const newVerificationToken = new email_verification_tokens({
            userId: userId,
            token: verificationToken,
        });
        await newVerificationToken.save();
        sendVerificationEmail(user.Email, verificationToken);
       return res.status(200).json({
           message: "Email Sended Successfully",

           Date: new Date(),
       });
    } catch (err) {
     return res.status(500).json({ err });
    }
};

module.exports = { handle_send_Email };
