const express = require("express");

const asyncHandler = require("../../../middleware/asyncHandler");
const reportsController = require("../controller/reports.controller");

const reportsRouter = express.Router();

reportsRouter.get("/", asyncHandler(reportsController.getReports));

module.exports = reportsRouter;
