const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Respond with the list of books formatted neatly
    const formattedBooks = JSON.stringify(books, null, 2); // Neatly formats the JSON output
    res.status(200).send(formattedBooks);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;  // Retrieve the ISBN from request parameters
    
    // Check if the book exists in the books list
    if (books[isbn]) {
        // Return the book details as a JSON response
        res.status(200).json(books[isbn]);
    } else {
        // If the book is not found, return a 404 error with a message
        res.status(404).json({ message: "Book not found" });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author; // Get author from request parameters
    const filteredBooks = Object.values(books).filter((book) => book.author === author); // Filter books by author

    if (filteredBooks.length > 0) {
        res.send(filteredBooks); // Send the filtered books as a response
    } else {
        res.status(404).send("No books found by this author.");
    }
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title; // Get the title from the request parameters

    // Filter books based on the title
    const filteredBooks = Object.values(books).filter((book) => book.title === title);

    // If books with the given title are found, return them, otherwise send an error message
    if (filteredBooks.length > 0) {
        res.send(filteredBooks); // Send the filtered books as a response
    } else {
        res.status(404).send("No books found with this title.");
    }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Get ISBN from request parameters

    // Assuming books is an object where each key is an ISBN and value is the book details
    const book = books[isbn]; // Look for the book with the given ISBN

    // Check if the book exists
    if (book) {
        // If the book exists, send the reviews as the response
        res.json(book.reviews);  // Return the reviews of the book
    } else {
        // If no book is found with the given ISBN, send a 404 error
        res.status(404).send({ message: "No book found with this ISBN." });
    }
});


module.exports.general = public_users;
