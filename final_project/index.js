const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Configure session middleware for customer routes
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    // Extract the access token from the session
    const accessToken = req.session.accessToken;

    // Check if the token is available
    if (!accessToken) {
        return res.status(401).json({ message: "Access token is required for authentication." });
    }

    // Verify the access token
    const secretKey = "fingerprint_customer"; // Secret key used for signing tokens
    jwt.verify(accessToken, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired access token." });
        }

        // Add user info to the request object for downstream processing
        req.user = user;

        // Proceed to the next middleware or route handler
        next();
    });
});

// Routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log("Server is running on port", PORT));
