const { Router } = require("express");
const loginRouter = Router();
const loginController = require("../controllers/loginController");

loginRouter.get("/", loginController.getLogin);
loginRouter.post("/", loginController.postLogin);

module.exports = loginRouter;
