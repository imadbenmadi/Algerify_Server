const express = require("express");
const router = express.Router();
const StoreLogin = require("../../Controllers/Auth/StoreLogin");

// Object to track Storelogin attempts and block expiration time for each IP address
const StoreloginAttempts = {};
// Function to block an IP address for a specified duration (in milliseconds)
const blockIP = (ipAddress, duration) => {
    StoreloginAttempts[ipAddress] = {
        attempts: 1,
        expirationTime: Date.now() + duration,
    };
};
// Middleware to cleanup expired IP address blocks
const cleanupExpiredBlocks = () => {
    const currentTime = Date.now();
    Object.keys(StoreloginAttempts).forEach((ipAddress) => {
        if (StoreloginAttempts[ipAddress].expirationTime < currentTime) {
            delete StoreloginAttempts[ipAddress];
        }
    });
};
// Cleanup expired IP address blocks every minute
setInterval(cleanupExpiredBlocks, 60000); // Run every minute

// StoreLogin route handler
router.post("/", (req, res) => {
    const ipAddress = req.ip;

    // Check if the IP address is blocked and the block has expired
    if (
        StoreloginAttempts[ipAddress] &&
        StoreloginAttempts[ipAddress].expirationTime < Date.now()
    ) {
        delete StoreloginAttempts[ipAddress]; // Unblock the IP address
    }

    // Check if the IP address is already blocked
    if (StoreloginAttempts[ipAddress]) {
        // Check if Storelogin attempts threshold is exceeded
        if (StoreloginAttempts[ipAddress].attempts >= 5) {
            return res
                .status(429)
                .json({ error: "Too many Storelogin attempts. Try again later." });
        }
    }

    // Increment Storelogin attempts or set initial attempt if not present
    StoreloginAttempts[ipAddress] = StoreloginAttempts[ipAddress] || { attempts: 0 };
    StoreloginAttempts[ipAddress].attempts++;

    // Check if Storelogin attempts threshold is exceeded after incrementing
    if (StoreloginAttempts[ipAddress].attempts >= 5) {
        blockIP(ipAddress, 60000); // Block IP address for 1 minute (60000 milliseconds)
        return res
            .status(429)
            .json({ error: "Too many login attempts. Try again later." });
    }

    // Handle login
    StoreLogin.handleLogin(req, res);
});

module.exports = router;
