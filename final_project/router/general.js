const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(404)
      .json({ message: "Username and/or password was not provided" });
  }
  if (!isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ username: username, password: password });
  return res
    .status(200)
    .json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  return res.send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  const book = books[parseInt(req.params.isbn)];
  if (book) {
    return res.json(book);
  } else {
    return res
      .status(404)
      .json({ message: "Could not find book with isbn: " + req.params.isbn });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const author_books = Object.fromEntries(
    Object.entries(books).filter(
      ([_, book]) => book.author === req.params.author,
    ),
  );
  if (author_books) {
    return res.json(author_books);
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  const title_books = Object.fromEntries(
    Object.entries(books).filter(
      ([_, book]) => book.title === req.params.title,
    ),
  );
  if (title_books) {
    return res.json(title_books);
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const book = books[parseInt(req.params.isbn)];
  if (book) {
    return res.json(book.reviews);
  } else {
    return res
      .status(404)
      .json({ message: "Could not find book with isbn: " + req.params.isbn });
  }
});

module.exports.general = public_users;
