const { Router } = require("express");
const dashboardRouter = Router();
const dashboardController = require("../controllers/dashboardController");
const { isAuth } = require("../middleware/authentication");

dashboardRouter.get("/", isAuth, dashboardController.getDashboard);

module.exports = dashboardRouter;
