const express = require("express");
const path = require("node:path");
const session = require("express-session");
const passport = require("./config/passport");
const {PrismaClient, PrismaClientExtends} = require("@prisma/client");
const { PrismaSessionStore} = require("@quixo3/prisma-session-store")
const app = express();
const prisma = new PrismaClient();
require("dotenv").config();

//Import routers

const homepageRouter = require("./routes/homepage");
//

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
      prisma,
      {
        checkPeriod: 2* 60 * 60 * 1000, // 24 hour session
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
);

app.use(passport.initialize());
app.use(passport.session());

//Routing

app.use("/", homepageRouter);


//Routing

app.listen(3000, (error) => {
  if (error) {
    throw error;
  }
  console.log("Listening on port 3000!");
});
