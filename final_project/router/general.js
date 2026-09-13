const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

// Task 6: Registrazione di un nuovo utente
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.filter((user) => user.username === username).length > 0;
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 1: Elenco di tutti i libri disponibili
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Dettagli del libro in base all'ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  }
  return res.status(404).json({ message: "Book not found for the given ISBN" });
});

// Task 3: Dettagli dei libri in base all'autore
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = [];

  Object.keys(books).forEach((key) => {
    if (books[key].author === author) {
      booksByAuthor.push({ isbn: key, title: books[key].title, reviews: books[key].reviews });
    }
  });

  if (booksByAuthor.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbyauthor: booksByAuthor }, null, 4));
  }
  return res.status(404).json({ message: "No books found for the given author" });
});

// Task 4: Dettagli dei libri in base al titolo
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];

  Object.keys(books).forEach((key) => {
    if (books[key].title === title) {
      booksByTitle.push({ isbn: key, author: books[key].author, reviews: books[key].reviews });
    }
  });

  if (booksByTitle.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbytitle: booksByTitle }, null, 4));
  }
  return res.status(404).json({ message: "No books found for the given title" });
});

// Task 5: Recensioni di un libro
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  }
  return res.status(404).json({ message: "Book not found for the given ISBN" });
});

// Task 10: Elenco di tutti i libri usando async/await con Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Task 11: Dettagli del libro per ISBN usando le Promise con Axios
public_users.get('/promise/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then((response) => {
      return res.status(200).send(response.data);
    })
    .catch((error) => {
      return res.status(500).json({ message: "Error fetching book by ISBN", error: error.message });
    });
});

// Task 12: Dettagli dei libri per autore usando async/await con Axios
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});

// Task 13: Dettagli dei libri per titolo usando le Promise con Axios
public_users.get('/promise/title/:title', function (req, res) {
  const title = req.params.title;

  axios.get(`http://localhost:5000/title/${title}`)
    .then((response) => {
      return res.status(200).send(response.data);
    })
    .catch((error) => {
      return res.status(500).json({ message: "Error fetching books by title", error: error.message });
    });
});

module.exports.general = public_users;