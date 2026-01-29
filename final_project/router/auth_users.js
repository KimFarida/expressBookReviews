const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let user = users.find(user=> user.username ==username)
  return !user
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let user = users.find(user=> user.username ==username)
  if (!user) return false;

  return user.username == username && user.password == password

}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT Access Token
    let accessToken = jwt.sign({
      data: username
    }, 'access', { expiresIn: 60 * 60 });

    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    };

    return res.status(200).send("Customer successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let user = req.session.authorization.username;

  if (req.params.isbn && req.query.review){
    let isbn = req.params.isbn;
    let newReview =  req.query.review
    let book = books[isbn];

    if(book){
      // check if review of that id 
      book.reviews[user] = newReview;

      return res.status(200).json({
          message: `The review for the book with ISBN ${isbn} has been added/updated.`,
          reviews: book.reviews 
      });

    }
    return res.status(404).json({message: 'Book not found'})
  }
  return res.status(400).json({message: "Invalid request"});
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Retrieve username from session
  const book = books[isbn];

  if (book) {
    let reviews = book.reviews;
    
    // Check if the review by this user exists
    if (reviews[username]) {
      // Delete the review for the specific user
      delete reviews[username];
      
      return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`);
    } else {
      return res.status(404).json({ message: "No review found for this user to delete" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
