const { Router } = require("express");
const signupRouter = Router();
const signupController = require("../controllers/signupController");
const createUserValidation = require("../middleware/createUserValidation");

signupRouter.get("/", signupController.getSignup);
signupRouter.post("/", createUserValidation, signupController.postSignup);

module.exports = signupRouter;
