const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3500",
];
const corsOptions = {
    // origin: (origin, callback) => {
    //     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
    //         callback(null, true);
    //     } else {
    //         callback(new Error(`Not allowed by CORS , origin : ${origin}`));
    //     }
    // },
    origin: "*",
    optionsSuccessStatus: 200,
};
const credentials = (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Credentials", true);
    }
    next();
};
require("dotenv").config();
const limiter = rateLimit({
    windowMs: 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 100 requests per windowMs
    message: "Too many requests ,try again later.",
});

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(limiter);
app.use(cookieParser());
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", express.static(path.join(__dirname, "/Public")));

mongoose.set("strictQuery", false);
const mongoDB = process.env.MongoDB_URI;
async function connect_to_db() {
    await mongoose.connect(mongoDB, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
    });
}
connect_to_db()
    .then(() => console.log("connected Successfully "))
    .catch((err) => console.log(err));

app.get("/", (req, res) => {
    res.send("Hello From Aos");
});
// ----------------- Auth Routes -----------------
app.use("/check_Auth", require("./Routes/Auth/check_Auth"));
app.use("/Storecheck_Auth", require("./Routes/Auth/Store/Store_check_Auth"));
app.use("/Login", require("./Routes/Auth/Login"));
app.use("/Register", require("./Routes/Auth/Register"));
app.use("/Logout", require("./Routes/Auth/Logout"));
app.use("/VerifyAccount", require("./Routes/Auth/verifyAccount"));

app.use("/StoreLogin", require("./Routes/Auth/Store/StoreLogin"));
app.use("/StoreLogout", require("./Routes/Auth/Store/StoreLogout"));

app.use(
    "/Send_Verification_Email",
    require("./Routes/Emails/Send_Verification_Email")
);
app.use(
    "/ReSend_Verification_Email",
    require("./Routes/Emails/Resend_verification")
);
app.use("/is_email_verified", require("./Routes/Emails/is_email_verified"));

// app.use("/ForgotPassword", require("./Routes/Auth/Password/ForgotPassword"));
// app.use("/ResetPassword", require("./Routes/Auth/Password/ResetPassword"));
// app.use("/ChangePassword", require("./Routes/Auth/Password/ChangePassword"));

// ----------------- App Routes -----------------
app.use("/Users", require("./Routes/Users"));
app.use("/Stores", require("./Routes/Store"));
app.use("/Products", require("./Routes/Product"));

app.listen(3000);

module.exports = app;
