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

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  if (req.body.username && req.body.password){
    let username = req.body.username
    let password = req.body.password

    if (authenticatedUser(username, password)){
      let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = { accessToken, username }; 

      return res.status(200).json({
          message: "User logged in successfully",
          accessToken: accessToken,
          username: username
      });
    }
    
    return res.status(400).json({message: "Invalid Login Details"})
    
    
    
  }

  return res.status(400).json({message: "Please input username and password to login"});
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
      let reviews = book.reviews;
      reviews[user] = newReview;
      console.log(books)

      return res.status(201).json({message: `Reviews for ${book.title} updated sucessfully`, bookReviews : `${JSON.stringify(book.reviews)}`})


    }
    return res.status(404).json({message: 'Book not found'})
  }
  return res.status(300).json({message: ""});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  let user = req.session.authorization.username;
  if (req.params.isbn && req.query.review){
    let isbn = req.params.isbn;
    let book = books[isbn];

    if(book){
      // check if review of that id 
      let reviews = book.reviews.filter(review=> review.user != user);
      book.reviews = reviews;

      console.log(books)

      return res.status(204).json({message: `Reviews for ${book.title} -  ${user} deleted sucessfully`, bookReviews : `${JSON.stringify(book.reviews)}`})


    }
    return res.status(404).json({message: 'Book not found'})
  }
  return res.status(300).json({message: ""});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
