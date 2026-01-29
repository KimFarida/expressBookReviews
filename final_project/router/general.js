const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBooks = new Promise((resolve, reject) => {
          resolve(books);
      });


public_users.post("/register", (req,res) => {
  if (req.body.username && req.body.password){
      let username = req.body.username
      let password = req.body.password
  
      if (!isValid(username)) return res.status(400).json({message: "This username already existed"})
      
      let user = {
        username : username,
        password : password
      }
      users.push(user);
  
      return res.status(200).json({message: "User created successfully"});
    }
  else{
    return res.status(400).json({message: "Please input username and password to login"});
  }
  
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {

    const allBooks = await getBooks;
    
    return res.status(200).json({
        message: "Books successfully retrieved", 
        books: allBooks
    });

  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});
// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  //Write your code here
  try {

    const books = await getBooks;

    if (req.params.isbn){
      let isbn = req.params.isbn
      let book = books[isbn];

      if (book){
        return res.status(300).json({message: "Book succcessfully retrieved", book: JSON.stringify(book)});
      }
      else{
        return res.status(404).json({message: "Book not found"});
      }
  }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
  

 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  //Write your code here
  try {

    const books = await getBooks;
    if (req.params.author){
    let author = req.params.author.toLowerCase()
    
    const booksAuthor = Object.values(books).filter(book => 
        book.author.toLowerCase() === author
    );


    if (booksAuthor.length > 0) {
        return res.status(200).json({
            message: `Books with Author "${author}" successfully retrieved`, 
            books: booksAuthor
        });
    } else {
        return res.status(404).json({ message: "No books with this title found" });
    }

  }
  
    
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
  

});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  //Write your code here
  const books = await getBooks;
  try {
    if (req.params.title) {
    const title = req.params.title.toLowerCase();
    

    const booksTitle = Object.values(books).filter(book => 
        book.title.toLowerCase() === title
    );

    if (booksTitle.length > 0) {
        return res.status(200).json({
            message: `Book with title "${req.params.title}" successfully retrieved`, 
            books: booksTitle
        });
    } else {
        return res.status(404).json({ message: "No books with this title found" });
    }
}
    
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
  

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  if (req.params.isbn){
    let isbn = req.params.isbn
    let book = books[isbn];

    if (book.reviews.length > 0){
      return res.status(300).json({message: `Book Reviews for ${book.title} succcessfully retrieved`, reviews: JSON.stringify(book.reviews)});
    }
    else{
      return res.status(404).json({message: `No book reviews for  ${book.title} found`});
    }
  }
});

module.exports.general = public_users;
