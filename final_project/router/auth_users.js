const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return !users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password,
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(404)
      .json({ message: "Username and/or password was not provided" });
  }

  if (!authenticatedUser(username, password)) {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }

  let accessToken = jwt.sign({ data: password }, "access", {
    expiresIn: 60 * 60,
  });

  req.session.authorization = {
    accessToken,
    username,
  };

  return res.json({ message: "User successfully logged in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const book = books[parseInt(req.params.isbn)];
  const { username } = req.session.authorization;
  const { review } = req.body;

  if (!book) {
    return res
      .status(404)
      .json({ message: "Could not find book with isbn: " + req.params.isbn });
  }
  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }
  if (!review) {
    return res.status(403).json({ message: "No review provided" });
  }

  books[parseInt(req.params.isbn)].reviews[username] = review;

  return res.json({ message: "Review added" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const book = books[parseInt(req.params.isbn)];
  const { username } = req.session.authorization;

  if (!book) {
    return res
      .status(404)
      .json({ message: "Could not find book with isbn: " + req.params.isbn });
  }
  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  delete books[parseInt(req.params.isbn)].reviews[username];

  return res.json({ message: "Review deleted" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
