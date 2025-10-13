const { Router } = require("express");
const folderRouter = Router();
const folderController = require("../controllers/folderController");
const folderRepo = require("../db/folderRepo");
const { isAuth } = require("../middleware/authentication");

folderRouter.post("/", isAuth, folderController.postCreateFolder);
folderRouter.get("/:id/download", isAuth, folderController.downloadFolder);

folderRouter.post("/:id/rename", isAuth, folderRepo.renameFolder);
folderRouter.post("/:id/delete", isAuth, folderRepo.deleteFolderCascade);

module.exports = folderRouter;
