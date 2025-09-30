const { Router } = require("express");
const homepageRouter = Router();
const homepageController = require("../controllers/homepageController");

homepageRouter.get("/", homepageController.getHomepage);

module.exports = homepageRouter;
