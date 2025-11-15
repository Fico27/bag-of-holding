const { Router } = require("express");
const fileRouter = Router();
const { isAuth } = require("../middleware/authentication");
require("dotenv").config();
const multer = require("multer");
const fileController = require("../controllers/fileController");

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",

    // Documents
    "application/pdf",
    "text/plain",
    "text/csv",

    // Microsoft Office
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // OpenDocument
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.spreadsheet",

    // Archives
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",

    // Code & Data
    "application/json",
    "text/javascript",
    "text/x-python",
    "text/x-java-source",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type."));
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

fileRouter.post("/:id/share", isAuth, fileController.postCreateFileShare);

module.exports = fileRouter;
