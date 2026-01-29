const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBooks = () => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("Books data not available");
        }
    });
};

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    if (isValid(username)) { 
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(400).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Task 10: Get the book list available in the shop using async-await
public_users.get('/', async function (req, res) {
  try {

    const allBooks = await getBooks();
    
    return res.status(200).json({
        message: "Books successfully retrieved", 
        books: allBooks
    });

  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBooks().then(
        (booksData) => {
            const book = booksData[isbn];
            if (book) {
                // Removed JSON.stringify to return a proper JSON object
                return res.status(200).json(book);
            } else {
                return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
            }
        },
        (error) => res.status(500).json({ message: error })
    );
});
  
  
// Task 12: Get book details based on author using async-await
public_users.get('/author/:author', async function (req, res) {
    try {
        const booksData = await getBooks();
        console.log(booksData)
        const author = req.params.author.toLowerCase();
        
        /* Filtering logic: Convert books object to an array, 
           then filter based on lowercase author name match.
        */
        const filteredBooks = Object.values(booksData).filter(
            (book) => book.author.toLowerCase() === author
        );

        if (filteredBooks.length > 0) {
            return res.status(200).json({ booksByAuthor: filteredBooks });
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books by author" });
    }
});;

// Task 13: Get all books based on title using async-await
public_users.get('/title/:title', async function (req, res) {
    try {
        const booksData = await getBooks();
        const title = req.params.title.toLowerCase();

        // Filtering logic: Find books where the title matches the parameter
        const filteredBooks = Object.values(booksData).filter(
            (book) => book.title.toLowerCase() === title
        );

        if (filteredBooks.length > 0) {
            return res.status(200).json({ booksByTitle: filteredBooks });
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books by title" });
    }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
