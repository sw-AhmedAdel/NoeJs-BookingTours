const mongoose = require("mongoose");
const Tour = require("./tour.mongo");
const reviewsScheam = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty"],
      minlength: [5, "Review length must be over than 5 chars"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be bigger than or equal 1"],
      max: [5, "Rating must be less then or equal 5"],
    },
    //reivew will have the tour id and the user id coz user will write his review about the tour
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    timestamps: true,
    // it make sure if we have a virtual property its not store in model it makes it display luke user and tour
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// here i can show the tour and user data that id is in the reivew
//Note: in the tour i want to populate the reviews once i do that
// evey thing in user and tour will be populated which is user and tour
// why? coz i made them populate so get on tour and remove the code above u will ses i will get the reviews but the tour and
// the user will not be populated so if i want to get just the review the user will be populated in reviews
reviewsScheam.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name",
  }); /*.populate({
    path: "tour",
    select: "name",
  });*/
  next();
});

// meand each user will have one review on the tour
reviewsScheam.index(
  { user: 1, tour: 1 },
  {
    unique: true,
  }
);

reviewsScheam.statics.calcAverageRatings = async function (tourID) {
  // use this it will work on the model which is Review and this is why i use statics, its point to the model
  const stats = await Review.aggregate([
    {
      $match: {
        tour: tourID, //  this tourID is in the review so give me all reviews doc has this tour id
      },
    },
    {
      $group: {
        _id: "$tour", // group all of them means put all reviews that has same tour id in one group
        numRatings: { $sum: 1 },
        avgRatings: { $avg: "$rating" },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourID, {
    ratingsQuantity: stats[0]?.numRatings || 0,
    ratingsAverage: stats[0]?.avgRatings || 0,
  });
};

// can not create this function below Review coz the post middlware fun will not be tragered coz i assigned reviewScheam to the model
reviewsScheam.post("save", async function () {
  //use it when save the reivew make tha all stats on tour
  //here use constructor coz it points to the model review coz it did not create yet
  // use review.constructor why coz it is supposed to use the model which is reviews but here it did not create yer
  const review = this;
  await review.constructor.calcAverageRatings(review.tour);
});

const Review = mongoose.model("Review", reviewsScheam);
module.exports = Review;
