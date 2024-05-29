const express = require("express");
const router = express.Router();
const RegisterController = require("../../Controllers/Auth/RegisterController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dns = require("dns");
const { Users } = require("../../models/Database");

const isEmailValid = (Email) => {
    // return new Promise((resolve, reject) => {
    //     const domain = Email.split("@")[1];
    //     dns.resolve(domain, "MX", (err, addresses) => {
    //         if (err || !addresses || addresses.length === 0) {
    //             resolve(false);
    //         } else {
    //             dns.resolve(domain, (err, addresses) => {
    //                 if (err || !addresses || addresses.length === 0) {
    //                     resolve(false);
    //                 } else {
    //                     resolve(true);
    //                 }
    //             });
    //         }
    //     });
    // });
    return new Promise((resolve, reject) => {
        resolve(true);
    });
};
const validate_inputs = async (req, res, next) => {
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
    console.log("body :", req.body);
    const isValidTelephone = /^(0)(5|6|7)[0-9]{8}$/.test(Telephone);
    if (
        !FirstName ||
        !LastName ||
        !Email ||
        !Password ||
        !Gender ||
        !Telephone
    ) {
        return res.status(409).json({ message: "Missing Data" });
    } else if (FirstName.length < 3) {
        return res
            .status(409)
            .json({ message: "First Name must be more that 3 chars" });
    } else if (LastName.length < 3) {
        return res
            .status(409)
            .json({ message: "Last Name must be more that 3 chars" });
    } else if (FirstName.length > 14) {
        return res.status(409).json({
            message: "First Name must be less than 14 chars",
        });
    } else if (LastName.length > 14) {
        return res.status(409).json({
            message: "LastName must be less than 14 chars",
        });
    } else if (Password.length < 8) {
        return res
            .status(409)
            .json({ error: "Password must be at least 8 characters" });
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(Email)) {
        return res.status(409).json({ error: "Invalid Email" });
    } else if (Gender !== "male" && Gender !== "female") {
        return res.status(409).json({
            error: "Invalid Gender, accepted values: male or female",
        });
    } else if (Telephone.length < 9) {
        return res
            .status(409)
            .json({ error: "Telephone must be at least 9 characters" });
    } else if (!isValidTelephone) {
        return res.status(409).json({ error: "Telephone must be a number" });
    } else if (Age && isNaN(Age)) {
        return res.status(409).json({ error: "Age must be a number" });
    } else if (Address && Address.length < 5) {
        return res
            .status(409)
            .json({ error: "Address must be at least 5 characters" });
    }
    if (!(await isEmailValid(Email))) {
        return res.status(409).json({ error: "Invalid email domain" });
    }
    const existingUser = await Users.findOne({ Email: Email });
    if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
    }
    next();
};
// const upload = multer({
//     limits: { fileSize: 5 * 1024 * 1024 }, // Limiting file size to 5 MB
//     storage: multer.diskStorage({
//         destination: function (req, file, cb) {
//             const destinationPath = path.join(__dirname, "../../Public/Users");
//             if (!fs.existsSync(destinationPath)) {
//                 fs.mkdirSync(destinationPath, { recursive: true });
//             }
//             cb(null, destinationPath);
//         },
//         // filename: function (req, file, cb) {
//         //     const uniqueSuffix =
//         //         Date.now() + "-" + Math.round(Math.random() * 1e9);
//         //     const fileExtension = getFileExtension(file.originalname);
//         //     if (!fileExtension) return cb(new Error("Invalid file type"));
//         //     const generatedFilename = `${uniqueSuffix}${fileExtension}`;
//         //     req.generatedFilename = generatedFilename;
//         //     cb(null, generatedFilename);
//         // },
//         filename: function (req, file, cb) {
//             const uniqueSuffix =
//                 Date.now() + "-" + Math.round(Math.random() * 1e9);
//             const fileExtension = path.extname(file.originalname);
//             const generatedFilename = `${uniqueSuffix}${fileExtension}`;
//             req.generatedFilename = generatedFilename;
//             cb(null, generatedFilename);
//         },
//     }),
// });

router.post(
    "/",
    (req, res, next) => {
        validate_inputs(req, res, next);
    },

    async (req, res) => {
        RegisterController.Save_to_db(req, res);
    }
);

module.exports = router;
