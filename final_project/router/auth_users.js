const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    
    let userWithSameName = users.filter((user) => {
        return user.username === username;     
    });
    if(userWithSameName.length > 0) {
        return true; 
    } else {
        return false;
    }
    
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validUsers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });

    if(validUsers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  req.session.username = username;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
  }

  if(authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
        data: password
        },
        'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const currentUser = req.session.username;
    
    if (!currentUser) {
        return res.status(401).send('User not logged in');
    }

    const newReview = req.body.review || req.query.review;

    books[isbn].reviews[currentUser] = newReview;

    return res.status(200).json({ 
        message: "Review added/updated", 
        reviews: books[isbn].reviews 
    });

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
