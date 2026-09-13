const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Verifica che lo username sia valido (non gia registrato)
const isValid = (username) => {
  const userExists = users.filter((user) => user.username === username).length > 0;
  return !userExists;
};

// Verifica che username e password corrispondano a un utente registrato
const authenticatedUser = (username, password) => {
  const validUsers = users.filter(
    (user) => user.username === username && user.password === password
  );
  return validUsers.length > 0;
};

// Task 7: Login di un utente registrato
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in. Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "User successfully logged in", token: accessToken });
  }

  return res.status(208).json({ message: "Invalid Login. Check username and password" });
});

// Task 8: Aggiunta o modifica di una recensione
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for the given ISBN" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `The review for the book with ISBN ${isbn} has been added or updated`,
    reviews: books[isbn].reviews
  });
});

// Task 9: Eliminazione della recensione dell'utente
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for the given ISBN" });
  }

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({
      message: `Review for the book with ISBN ${isbn} posted by the user ${username} deleted`,
      reviews: books[isbn].reviews
    });
  }

  return res.status(404).json({ message: "No review found for this user on this book" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;