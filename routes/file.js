const { Router } = require("express");
const fileRouter = Router();
const isAuth = require("../middleware/authentication");
require("dotenv").config();

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

fileRouter.post("/upload", isAuth, upload.single("file"));

module.exports = fileRouter;
