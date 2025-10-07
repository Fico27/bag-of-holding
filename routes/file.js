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

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "text/plain",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, PDF, and TXT are allowed.")
    );
  }
};

const upload = multer({
  storage,
  limits: { fieldSize: 5 * 1024 * 1024 },
  fileFilter,
});

fileRouter.post("/upload", isAuth, upload.single("file"));

module.exports = fileRouter;
