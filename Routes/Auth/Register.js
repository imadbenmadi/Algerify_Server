const express = require("express");
const router = express.Router();
const RegisterController = require("../../Controllers/Auth/RegisterController");
const registrationAttempts = {};
const blockIP = (ipAddress, duration) => {
    registrationAttempts[ipAddress] = {
        attempts: 1,
        expirationTime: Date.now() + duration,
    };
};
const cleanupExpiredBlocks = () => {
    const currentTime = Date.now();
    Object.keys(registrationAttempts).forEach((ipAddress) => {
        if (registrationAttempts[ipAddress].expirationTime < currentTime) {
            delete registrationAttempts[ipAddress];
        }
    });
};
setInterval(cleanupExpiredBlocks, 60000); 
router.post("/", async (req, res) => {
    const ipAddress = req.ip;
    if (
        registrationAttempts[ipAddress] &&
        registrationAttempts[ipAddress].expirationTime < Date.now()
    ) {
        delete registrationAttempts[ipAddress]; // Unblock the IP address
    }
    if (registrationAttempts[ipAddress]) {
        if (registrationAttempts[ipAddress].attempts >= 5) {
            return res
                .status(429)
                .json({ error: "Too many login attempts. Try again later." });
        }
    }
    registrationAttempts[ipAddress] = registrationAttempts[ipAddress] || {
        attempts: 0,
    };
    registrationAttempts[ipAddress].attempts++;
    if (registrationAttempts[ipAddress].attempts > 5) {
        blockIP(ipAddress, 300000); // Block IP address for 5 minutes (300,000 milliseconds)
        return res.status(429).json({
            error: "Too many registration attempts. Try again later.",
        });
    }
    RegisterController.handleRegister(req, res);
});

module.exports = router;
