const express = require("express");
const tourRouter = express.Router();
const {
  httpCreateTour,
  httpGetAllTours,
  httpFindOneTour,
  httpUpdateOneTours,
  httpDeleteOneTours,
  getTopFiveBestTours,
  httpGetStaticData,
  httpGetMonthlyPlans,
} = require("./tour.contoller");

const { catchAsync } = require("../../services/servicesFunctions");

const { auth, restrictedTo } = require("../../auth/auth");

tourRouter.get("/", catchAsync(httpGetAllTours));
tourRouter.get("/:id", catchAsync(httpFindOneTour));
tourRouter.get("/top", getTopFiveBestTours, catchAsync(httpGetAllTours));
tourRouter.get("/monthly/:year", catchAsync(httpGetMonthlyPlans));

tourRouter.use(catchAsync(auth));
tourRouter.post("/", restrictedTo("guide"), catchAsync(httpCreateTour));
tourRouter.get("/stats", restrictedTo("guide"), catchAsync(httpGetStaticData));
tourRouter.patch("/:id", restrictedTo("guide"), catchAsync(httpUpdateOneTours));
tourRouter.delete(
  "/:id",
  restrictedTo("guide"),
  catchAsync(httpDeleteOneTours)
);

module.exports = tourRouter;
