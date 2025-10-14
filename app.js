require("dotenv").config();
const express = require("express");
const path = require("node:path");
const session = require("express-session");
const passport = require("./config/passport");
const { PrismaClient, PrismaClientExtends } = require("./generated/prisma");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const app = express();
const prisma = new PrismaClient();

app.locals.fileSize = function (bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n)) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0,
    v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return v.toFixed(v >= 10 || i === 0 ? 0 : 1) + " " + units[i];
};

//Import routers

const homepageRouter = require("./routes/homepage");
const signupRouter = require("./routes/signup");
const loginRouter = require("./routes/login");
const dashboardRouter = require("./routes/dashboard");
const logoutRouter = require("./routes/logout");
const fileRouter = require("./routes/file");
const folderRouter = require("./routes/folderRouter");
const shareRouter = require("./routes/shareRouter");
//
app.use(express.static(path.join("./scripts")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 24 * 60 * 60 * 1000, // 24 hour session
      // dbRecordIdIsSessionId: true,
      // dbRecordIdFunction: undefined,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

//Routing

app.use("/", homepageRouter);
app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use("/dashboard", dashboardRouter);
app.use("/logout", logoutRouter);
app.use("/files", fileRouter);
app.use("/folders", folderRouter);
app.use("/shared", shareRouter);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
//Routing

app.listen(3000, (error) => {
  if (error) {
    throw error;
  }
  console.log("Listening on port 3000!");
});

// Clean up and disconnect prisma
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await prisma.$disconnect();
  console.log("Disconnected");
  process.exit();
});
