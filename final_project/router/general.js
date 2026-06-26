const express = require('express');
const books = require('./booksdb.js');
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
public_users.get('/',async function (req, res) {
    //res.status(200).send(JSON.stringify(books, null, 4));

    const booksData = await Promise.resolve(books);

    try {
        if (Object.keys(booksData).length > 0) {
            res.status(200).send(JSON.stringify(booksData, null, 4));
        } else {
            const error = new Error("No books found");
            error.status = 404;
            error.code = 'BOOKS_NOT_FOUND';
            throw error;
        }
    } catch (error) {
        console.error('Error fetching books:', error);
        if (error.status === 404) {
            res.status(404).json({ message: error.message, error: error.code });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    } 
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    
    const byIsbn = await Promise.resolve(req.params.isbn);
    
    try {
        if (!byIsbn || byIsbn.trim() === '') {
            const error = new Error('ISBN parameter is required');
            error.status = 400;
            error.code = 'BAD_REQUEST';
            throw error;
        }

        if (books.hasOwnProperty(byIsbn)) {
            res.status(200).json(books[byIsbn]);
        } else {
            const error = new Error(`No ISBN found: ${byIsbn}`);
            error.status = 404;
            error.code = 'ISBN_NOT_FOUND';
            throw error;
        }
        
    } catch (error) {
        console.error('Error fetching books by ISBN:', error);
        if (error.status === 404) {
            res.status(404).json({ message: error.message, error: error.code });
        } else if (error.status === 400) {
            res.status(400).json({ message: error.message, error: error.code });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {

    const booksByAuthor = await Promise.resolve(req.params.author);

    try {

        if (!booksByAuthor || booksByAuthor.trim() === '') {
            const error = new Error('Author parameter is required');
            error.status = 400;
            error.code = 'BAD_REQUEST';
            throw error;
        }

        if (!books || Object.keys(books).length === 0) {
            const error = new Error('Book data currently unavailable');
            error.status = 503;
            error.code = 'SERVICE_UNAVAILABLE';
            throw error;
        }

        const results = Object.values(books).filter(book => book.author === booksByAuthor);

        if (results.length === 0) {
            const error = new Error(`No books found for author: ${booksByAuthor}`);
            error.status = 404;
            error.code = 'AUTHOR_NOT_FOUND';
            throw error;
        } else {
            res.status(200).json(results);
        }

    } catch (error) {
        console.error('Error fetching books by author:', error);
        if (error.status === 404) {
            res.status(404).json({ message: error.message, error: error.code });
        } else if (error.status === 400) {
            res.status(503).json({ message: error.message, error: error.code });
        } else if (error.status === 400) {
            res.status(400).json({ message: error.message, error: error.code });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    //res.send(results);
    const booksByTitle = await Promise.resolve(req.params.title);

    try {
        let results = [];

        if (!booksByTitle || booksByTitle.trim() === '') {
            const error = new Error('Title parameter is required');
            error.status = 400;
            error.code = 'BAD_REQUEST';
            throw error;
        }

        for (const [key, value] of Object.entries(books)) {
            //console.log(`${key}: ${value}`);
            if (value.title === booksByTitle) {
              results.push(value);
            }
        }

        if (results.length === 0) {
            const error = new Error(`No books found for title: ${booksByTitle}`);
            error.status = 404;
            error.code = 'TITLE NOT FOUND';
            throw error;
        } else {
            res.status(200).json(results);
        }
    } catch (error) {
        console.error('Error fetching books by title:', error);
        if (error.status === 404) {
            res.status(404).json({ message: error.message, error: error.code });
        } else if (error.status === 400) {
            res.status(400).json({ message: error.message, error: error.code });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
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
