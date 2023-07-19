const Review = require("./reviews.mongo");
const Tour = require("./tour.mongo");

async function GetAllReviews(filter) {
  return await Review.find(filter);
}

async function FindTour(id) {
  return await Tour.findById(id);
}

async function CreateReview(reviewBody, user_id, tour_id) {
  // const newReview = await reviews.create(review)
  const review = Object.assign(reviewBody, {
    tour: tour_id,
    user: user_id,
  });
  const newReview = new Review(review);
  await newReview.save();
  return newReview;
}

async function UpdateReview(review, id) {
  const newReview = await Review.findByIdAndUpdate(id, review, {
    new: true,
    runValidators: true,
  });
  return newReview;
}

async function findReview(filter) {
  return await Review.findOne(filter);
}

async function DeleteReview(id) {
  const review = await Review.findOneAndDelete({
    _id: id,
  });
  return review;
}

module.exports = {
  GetAllReviews,
  CreateReview,
  UpdateReview,
  FindTour,
  findReview,
  DeleteReview,
};
