const mongoose = require("mongoose");
const User = require("./user.mongo");
const tourSchema = new mongoose.Schema(
  {
    name: {
      unique: true,
      type: String,
      required: [true, "tour must have a name"],
      trim: true,
      maxlength: [40, "A tour name must have less or equal than 40 chars"],
      minlength: [10, "A tour name must have more or equal than 10 chars"],
    },
    price: {
      type: Number,
      required: [true, "Tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        //this works for only create new tour using save or create, if i want to update this will not work
        // the validator will not work in update
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below original price",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1"],
      max: [5, "Rating must be bellow or equal 5.0"],
      set: (val) => Math.round(val * 10) / 10, // 4.7,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: ["Tour must have a durations"],
    },
    difficulty: {
      type: String,
      required: [true, "Tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "difficulty is either : easy , medium , difficult",
      },
    },
    maxGroupSize: {
      type: Number,
      required: ["Tour must have a group size"],
    },
    summary: {
      type: String,
      require: [true, "Tour must have a summary"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDates: {
      type: [Date],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//tourSchema.index({ name: 1 }, { unique: true });

tourSchema.index({ company: 1 });
tourSchema.index({ category: 1 });
tourSchema.index({ ratingsAverage: 1, price: 1, name: 1 });
tourSchema.index({ price: 1, name: 1, category: 1 });
tourSchema.virtual("dd").get(function () {});

// use get coz this will work when i get document and use regulare function not arrow  coz arrow does not get its own this

/*
// Dcoument middleware
// Pre middleware so i can modify the doc, this just works with save or create like Tour.create or tour.save()
tourSchema.pre("save", function (next) {
  const tour = this;
  //console.log(tour);
  next();
});

//this is after the tour is sotred
tourSchema.post("save", function (tour, next) {
  //console.log(tour)
  next();
});*/

//Query middleware run query before or after execute query
// means if i want to execute find tours the below will be chain to it, and after that execute

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// this is the hock after execute the query
tourSchema.post(/^find/, function (doc, next) {
  next();
});

// aggregation middleware i can add hock before or after execute the aggregation query
tourSchema.pre("aggregate", function (next) {
  // pipeline is an array has what is in aggregate like match group sort etc so i need to add to this array using unshift
  // [match , group , sort] so use unshift to add another match to be in the first array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //console.log(this.pipeline());
  next();
});

/*
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v",
  });
  next();
});
*/
// use embeded way which means the tour will have guides which is gonna be an array has the all info about guides
// means guides is array and inside it obj each obj has info about the guide user
/*

// add this   guides: Array, in the model above
const User = require("./user.mongo");
tourSchema.pre("save", async function (next) {
  const guidesPromisies = this.guides.map(
    async (id) => await User.findOne({ _id: id })
  );
  // this will create an array as a array promising 
  this.guides = await Promise.all(guidesPromisies);
  next();
});*/

// Virtual Populate: Tours and Reviews means show review on the tour when i get the tour
// enven the tour is is not sotre in the tour like tour id is sotre in the reivew
// and go to find tour to populate it

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});
const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
