const express = require("express");
const path = require("node:path");
const session = require("express-session");
const passport = require("passport");
const { error } = require("node:console");
const app = express();
require("dotenv").config();

//Reminder to require passport config when setup

//Here
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", (req, res) => {
  res.send("I will be the login page.");
});

app.listen(3000, (error) => {
  if (error) {
    throw error;
  }
  console.log("Listening on port 3000!");
});
