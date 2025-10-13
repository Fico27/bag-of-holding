const { Router } = require("express");
const fileRouter = Router();
const { isAuth } = require("../middleware/authentication");
require("dotenv").config();
const multer = require("multer");
const fileController = require("../controllers/fileController");

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
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

fileRouter.post("/", isAuth, upload.single("file"), fileController.uploadFile);
fileRouter.get("/:id/download", isAuth, fileController.downloadFile);

fileRouter.post("/:id/rename", isAuth, fileController.renameFile);
fileRouter.post("/:id/delete", isAuth, fileController.deleteFile);

module.exports = fileRouter;
