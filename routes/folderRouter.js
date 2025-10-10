const { Router } = require("express");
const folderRouter = Router();
const folderController = require("../controllers/folderController");
const { isAuth } = require("../middleware/authentication");

folderRouter.post("/", isAuth, folderController.postCreateFolder);

// add folderController for downloads
folderRouter.get("/:id/download", isAuth, folderController.downloadFolder);

module.exports = folderRouter;
