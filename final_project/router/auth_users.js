const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // For hashing passwords
let books = require("./booksdb.js");  // Assuming booksdb.js exists
const regd_users = express.Router();

let users = [];  // In-memory user storage (for simplicity)
const JWT_SECRET = 'your_secret_key';  // Change this to a more secure key

// Helper function to check if the username is valid (not already taken)
const isValid = (username) => {
    return !users.some(user => user.username === username);
};

// Helper function to authenticate a user based on username and password
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user && bcrypt.compareSync(password, user.password); // Compare password with hashed password
};

// POST route to register the user (for testing login functionality)
regd_users.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Check if the username is valid (not taken)
    if (!isValid(username)) {
        return res.status(400).json({ error: 'Username already exists.' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Save the user to the in-memory users array
    users.push({ username, password: hashedPassword });

    // Send success response
    return res.status(201).json({ message: 'User registered successfully.' });
});

// POST route for user login (authentication)
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Authenticate the user
    if (!authenticatedUser(username, password)) {
        return res.status(400).json({ error: 'Invalid username or password.' });
    }

    // Create a JWT token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

    // Send the token in the response
    return res.status(200).json({ message: 'Login successful', token });
});

// PUT route for adding a book review (only authenticated users can review)
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const token = req.headers['authorization'];  // Extract the token from the Authorization header

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        const username = decoded.username;  // Get the username from the decoded JWT token
        
        // Ensure the book exists in the booksdb
        const book = books.find(b => b.isbn === isbn);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Assuming book has a reviews property that is an array
        book.reviews.push({ username, review });
        return res.status(200).json({ message: 'Review added successfully', reviews: book.reviews });
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// Export the router and utility functions
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
