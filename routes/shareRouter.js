const { Router } = require("express");
const shareRouter = Router();
const shareController = require("../controllers/shareController");

shareRouter.get("/:id", shareController.viewShared);
shareRouter.get("/:id/download", shareController.downloadSingleFile);
shareRouter.get("/:id/files/:fileId/download", shareController.downloadShared);
shareRouter.get("/:id/folder/download", shareController.downloadSharedFolder);

module.exports = shareRouter;
