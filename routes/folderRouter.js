const { Router } = require("express");
const folderRouter = Router();
const folderController = require("../controllers/folderController");
const folderController = require("../controllers/folderController");
const { isAuth } = require("../middleware/authentication");

folderRouter.post("/", isAuth, folderController.postCreateFolder);
folderRouter.get("/:id/download", isAuth, folderController.downloadFolder);

folderRouter.post("/:id/rename", isAuth, folderController.renameFolder);
folderRouter.post("/:id/delete", isAuth, folderController.deleteFolder);

module.exports = folderRouter;
