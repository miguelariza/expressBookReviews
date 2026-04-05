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
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const detailsByIsbn = req.params.isbn;
    res.send(books[detailsByIsbn]);
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const booksByAuthor = req.params.author;
    let results = [];
    for (const [key, value] of Object.entries(books)) {
        //console.log(`${key}: ${value}`);
        if (value.author === booksByAuthor) {
          results.push(value);
        }
      }
    res.send(results);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const booksByTitle = req.params.title;
    let results = [];
    for (const [key, value] of Object.entries(books)) {
        //console.log(`${key}: ${value}`);
        if (value.title === booksByTitle) {
          results.push(value);
        }
      }
    res.send(results);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const byIsbn = req.params.isbn;
    for (const [key, value] of Object.entries(books)) {
        console.log(key);
        if (parseInt(key) === parseInt(byIsbn)) {
          res.send(value.reviews);
        }
      }      
});

module.exports.general = public_users;
