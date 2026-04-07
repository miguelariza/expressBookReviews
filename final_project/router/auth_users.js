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
        return res.status(401).json({messsage: 'User not logged in'});
    }

    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    const newReview = req.body.review || req.query.review;

    if (!newReview) {
        return res.status(400).json({ message: "Review content is required" });
    }

    books[isbn].reviews[currentUser] = newReview;

    return res.status(200).json({ 
        message: "Review added/updated", 
        reviews: books[isbn].reviews 
    });

});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const currentUser = req.session.username;

    let allReviews = books[isbn].reviews;

    const filteredByUser = Object.keys(allReviews)
    .filter(key => !key.includes(currentUser))
    .reduce((result, key) => {
        result[key] = allReviews[key];
        return result;
    }, {});

    books[isbn].reviews = filteredByUser;

    return res.status(200).json({ 
        message: `Reviews from ${currentUser} has been deleted.`,
        reviews: books[isbn].allReviews 
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
