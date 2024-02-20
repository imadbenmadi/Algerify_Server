const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const credentials = require("./Middleware/credentials");
const corsOptions = require("./config/corsOptions");
const path = require("path");
const limiter = rateLimit({
    windowMs: 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 100 requests per windowMs
    message: "Too many requests ,try again later.",
});
app.use(limiter);
app.use(cookieParser());
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", express.static(path.join(__dirname, "/Public")));

mongoose.set("strictQuery", false);
const mongoDB = "mongodb://127.0.0.1:27017/AOS";
async function connect_to_db() {
    await mongoose.connect(mongoDB, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
    });
}
connect_to_db().catch((err) => console.log(err));

// ----------------- Auth Routes -----------------
app.use("/check_Auth", require("./Routes/Auth/check_Auth"));
app.use("/Login", require("./Routes/Auth/Login"));
app.use("/Register", require("./Routes/Auth/Register"));
app.use("/Logout", require("./Routes/Auth/Logout"));
app.use("/VerifyAccount", require("./Routes/Auth/verifyAccount"));

app.use("/Send_Verification_Email", require("./Routes/Emails/Send_Verification_Email"));
app.use("/ReSend_Verification_Email",require("./Routes/Emails/Resend_verification"));
app.use("/is_email_verified", require("./Routes/Emails/is_email_verified"));

// app.use("/ForgotPassword", require("./Routes/Auth/Password/ForgotPassword"));
// app.use("/ResetPassword", require("./Routes/Auth/Password/ResetPassword"));
// app.use("/ChangePassword", require("./Routes/Auth/Password/ChangePassword"));


// ----------------- App Routes -----------------
app.use("/Users", require("./Routes/Users"));
app.use("/Store", require("./Routes/Store"));
app.use("/Product", require("./Routes/Product"));

app.listen(3000);

module.exports = app;
