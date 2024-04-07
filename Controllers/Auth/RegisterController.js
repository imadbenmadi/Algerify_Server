const {
    Users,
    email_verification_tokens,
    UserActions,
} = require("../../models/Database");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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
                    <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
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



const Save_to_db = async (req, res) => {
     const {
         FirstName,
         LastName,
         Email,
         Password,
         Age,
         Gender,
         Telephone,
         Address,
     } = req.body;
    try {
        const ProfilePic = req.generatedFilename;
        const verificationToken = generateVerificationCode();
        const newUser = new Users({
            FirstName: FirstName,
            LastName: LastName,
            Email: Email,
            Telephone: Telephone,
            Password: Password,
            Age: Age,
            Gender: Gender,
            ProfilePic: ProfilePic,
            Address: Address,
        });
        await newUser.save();
        const newVerificationToken = new email_verification_tokens({
            userId: newUser._id,
            token: verificationToken,
        });
        await newVerificationToken.save();
        sendVerificationEmail(Email, verificationToken);

        const userAction = new UserActions({
            userId: newUser._id,
            // Action: "Register",
            Date: new Date(),
        });
        await userAction.save();
        return res.status(200).json({
            message: "Account Created Successfully",
            _id: newUser._id,
            Date: new Date(),
        });
    } catch (err) {
        return res.status(400).json({ err });
    }
};

module.exports = { Save_to_db };
