const { Router } = require("express");
const loginRouter = Router();
const loginController = require("../controllers/loginController");

loginRouter.get("/", loginController.getLogin);

module.exports = loginRouter;
