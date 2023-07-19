const express = require("express");
const api = express.Router();
const userRouter = require("./user/user.router");
const tourRouter = require("./tour/tour.routes");
const reviewsRoute = require("./reviews/reviews.route");

api.use("/users", userRouter);
api.use("/tours", tourRouter);
api.use("/reviews", reviewsRoute);
module.exports = api;
