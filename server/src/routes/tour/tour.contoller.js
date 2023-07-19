const {
  CreateTour,
  GetAllTours,
  FindOneTour,
  UpdateOneTours,
  DeleteOneTours,
  GetStaticData,
  GetMonthlyPlans,
} = require("../../models/tour.models");

const Filter = require("../../services/class.filter");
const appError = require("../../services/error.global.express");
async function httpCreateTour(req, res, next) {
  // use try catch to catch any error like if name is uniqe and put same name of filed is not exits
  const tour = req.body;
  const newTour = await CreateTour(tour);
  return res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
}

async function httpGetAllTours(req, res, next) {
  const features = new Filter(req.query);
  const { limit, skip } = features.pagination();

  const tours = await GetAllTours(
    features.filter(),
    features.sort("-createdAt"),
    features.fields(),
    skip,
    limit
  );
  return res.status(201).json({
    status: "Scuess",
    data: {
      results: tours.length,
      tours,
    },
  });
}

async function httpFindOneTour(req, res, next) {
  const { id } = req.params;
  const tour = await FindOneTour({ _id: id });
  if (!tour) {
    return next(new appError("Tour is not found", 400));
  }
  return res.status(200).json({
    status: "sucess",
    tour,
  });
}

async function httpUpdateOneTours(req, res, next) {
  const { id } = req.params;
  const tour = req.body;
  const updatedTour = await UpdateOneTours(id, tour);
  if (!updatedTour) {
    return next(new appError("Tour is not found", 400));
  }
  return res.status(200).json({
    status: "sucess",
    tour: updatedTour,
  });
}

async function httpDeleteOneTours(req, res, next) {
  const id = req.params.id;
  const tour = await DeleteOneTours(id);
  if (!tour) {
    return next(new appError("Tour is not found", 400));
  }
  return res.status(200).json({
    status: `Deleted ${tour}`,
  });
}

async function httpGetStaticData(req, res, next) {
  const tours = await GetStaticData();
  return res.status(200).json({
    status: "sucess",
    data: {
      tours,
    },
  });
}

async function httpGetMonthlyPlans(req, res, next) {
  const { year } = req.params;
  const tours = await GetMonthlyPlans(Number(year));
  return res.status(200).json({
    status: "sucess",
    data: {
      tours,
    },
  });
}

// Use express middleware
function getTopFiveBestTours(req, res, next) {
  //limit=5&sort=-ratingsAverage,price
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage";
  next();
}

module.exports = {
  httpCreateTour,
  httpGetAllTours,
  httpFindOneTour,
  httpUpdateOneTours,
  httpDeleteOneTours,
  getTopFiveBestTours,
  httpGetStaticData,
  httpGetMonthlyPlans,
};
