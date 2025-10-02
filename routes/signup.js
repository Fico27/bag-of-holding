const { Router } = require("express");
const signupRouter = Router();
const signupController = require("../controllers/signupController");

signupRouter.get("/", signupController.getSignup);

module.exports = signupRouter;
