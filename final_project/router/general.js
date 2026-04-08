const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login."});
        } else {
            return res.status(404).json({message: "The username already exist, choose another."});  
        } 
    }
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    //res.status(200).send(JSON.stringify(books, null, 4));
    try {
        if (Object.keys(books).length > 0) {
            res.status(200).send(JSON.stringify(books, null, 4));
        } else {
            return res.status(404).json({
                message: `No books found"`,
                error: 'BOOKS_NOT_FOUND',
            });
        }
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Internal server error' });
    } 
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    try {
        const detailsByIsbn = req.params.isbn;

        if (!detailsByIsbn || detailsByIsbn.trim() === '') {
            return res.status(400).json({
                message: 'ISBN parameter is required',
                error: 'BAD_REQUEST'
            });
        }

        if (books.hasOwnProperty(detailsByIsbn)) {
            res.status(200).json(books[detailsByIsbn]);
        } else {
            return res.status(404).json({
                message: `No ISBN found: "${detailsByIsbn}"`,
                error: 'ISBN_NOT_FOUND',
            });
        }
        
    } catch (error) {
        console.error('Error fetching books by ISBN:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const booksByAuthor = req.params.author;

        if (!booksByAuthor || booksByAuthor.trim() === '') {
            return res.status(400).json({
                message: 'Author parameter is required',
                error: 'BAD_REQUEST'
            });
        }

        if (!books || Object.keys(books).length === 0) {
            return res.status(503).json({
                message: 'Book data currently unavailable',
                error: 'SERVICE_UNAVAILABLE'
            });
        }

        const results = Object.values(books).filter(book => book.author === booksByAuthor);

        if (results.length === 0) {
            return res.status(404).json({
                message: `No books found for author: "${booksByAuthor}"`,
                error: 'AUTHOR_NOT_FOUND',
            });
        } else {
            res.status(200).json(results);
        }
        
        
    } catch (error) {
        console.error('Error fetching books by author:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    //res.send(results);
    try {
        const booksByTitle = req.params.title;
        let results = [];

        if (!booksByTitle || booksByTitle.trim() === '') {
            return res.status(400).json({
                message: 'Title parameter is required',
                error: 'BAD_REQUEST'
            });
        }

        for (const [key, value] of Object.entries(books)) {
            //console.log(`${key}: ${value}`);
            if (value.title === booksByTitle) {
              results.push(value);
            }
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: `No books found for title: "${booksByTitle}"`,
                error: 'TITLE_NOT_FOUND',
            });
        } else {
            res.status(200).json(results);
        }
    } catch (error) {
        console.error('Error fetching books by title:', error);
        res.status(500).json({ message: 'Internal server error' });
    } 
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const byIsbn = req.params.isbn;
    for (const [key, value] of Object.entries(books)) {
        //console.log(key);
        if (parseInt(key) === parseInt(byIsbn)) {
            if (value.reviews !== null) {
                res.send(value.reviews);
            } else {
                return res.status(200).send("The book doesn't have reviews yet");
            }
        }
      }      
});

module.exports.general = public_users;
