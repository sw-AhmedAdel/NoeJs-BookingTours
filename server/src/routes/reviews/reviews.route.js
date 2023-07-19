const express = require("express");
const reviewsRoute = express.Router();

const {
  httpGetAllReviews,
  httpCreateReview,
  httpUpdateMyReview,
  httpDeleteReview,
} = require("./reviews.controllers");

const { catchAsync } = require("../../services/servicesFunctions");

const { auth, restrictedTo } = require("../../auth/auth");

reviewsRoute.post(
  "/:tourid/",
  catchAsync(auth),
  restrictedTo("user"),
  catchAsync(httpCreateReview)
);

reviewsRoute.patch(
  "/:reviewid",
  catchAsync(auth),
  restrictedTo("user"),
  catchAsync(httpUpdateMyReview)
);

reviewsRoute.delete(
  "/:reviewid",
  catchAsync(auth),
  restrictedTo("guide", "user"),
  catchAsync(httpDeleteReview)
);

reviewsRoute.get(
  "/",
  catchAsync(auth),
  restrictedTo("guide"),
  catchAsync(httpGetAllReviews)
);

reviewsRoute.get(
  "/:tourid",
  catchAsync(auth),
  restrictedTo("guide", "user"),
  catchAsync(httpGetAllReviews)
);

module.exports = reviewsRoute;
