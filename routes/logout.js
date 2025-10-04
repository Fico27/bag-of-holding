const { Router } = require("express");
const logoutRouter = Router();
const logoutController = require("../controllers/logoutController");

logoutRouter.post("/", logoutController.postLogout);

module.exports = logoutRouter;
