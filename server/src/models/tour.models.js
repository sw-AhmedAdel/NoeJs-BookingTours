const Tour = require("./tour.mongo");

async function CreateTour(tour) {
  //const newTour = await Tour.create(tour);
  const newTour = await Tour(tour);
  await newTour.save();
  return newTour;
}

async function GetAllTours(filter, sort, fileds, skip, limit) {
  return await Tour.find(filter)
    .sort(sort)
    .select(fileds)
    .skip(skip)
    .limit(limit);
}

async function FindOneTour(filter) {
  //populate use populate this will be 2 query to 1 to find the tour and query to populate the data
  return await Tour.findOne(filter, { __v: 0 })
    .populate({
      path: "guides",
      select: "name",
    })
    .populate("reviews");
  // this populate will populate reviews and if reviews has populate like user and tour they will be populate
}

async function UpdateOneTours(id, tour) {
  const updatedTour = await Tour.findByIdAndUpdate(id, tour, {
    new: true,
    runValidators: true,
  });
  return updatedTour;
}

async function DeleteOneTours(id) {
  const tour = await Tour.findByIdAndDelete(id);
  const { name } = tour ?? { name: null };
  return name;
}

async function GetStaticData() {
  const tours = await Tour.aggregate([
    // Stage one using match to get all doc i want
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    // Stage 2, Group all matches document in one group
    {
      $group: {
        //  _id: null, // is responsable for groubing
        //_id: { $toUpper: "$ratingsAverage" }, group each ratingsAverage in one group like 2 doc has 4.5 they will be in 1 group
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRatings: { $avg: "$ratingsAverage" },
        avgPrince: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    // Stage 3 i can sort using the above
    {
      $sort: {
        avgPrince: 1,
      },
    },
    // 4 stage i can took of some data using match
    // {   $match: {   _id: {  $ne: "EASY" }, }, },
  ]);

  return tours;
}

async function GetMonthlyPlans(year) {
  const tours = await Tour.aggregate([
    //unwind works on startDates, startDates has array which has dates so unwind take off each data and put it in its document
    //so i can have 3 document having same data except the start data
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    ,
    {
      $group: {
        _id: { $month: "$startDates" }, // use month and extract the month from
        numTours: { $sum: 1 },
        //        tours: { $push: { name: "$name", price: "$price" } },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: {
        // add month and the value is _id
        month: "$_id",
      },
    },

    {
      // remove
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        // not sort usinf fileds from group
        // month: 1,
        numTours: -1,
      },
    },

    // {$limit: 5}
  ]);
  return tours;
}

module.exports = {
  CreateTour,
  GetAllTours,
  FindOneTour,
  UpdateOneTours,
  DeleteOneTours,
  GetStaticData,
  GetMonthlyPlans,
};
