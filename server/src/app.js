const express = require("express");
const app = express();
const api = require("./routes/api");
const appError = require("./services/error.global.express");
const globalErrorHnadling = require("./services/global.errors.handling");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
app.use(helmet());
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: "Too many request",
});

app.use(express.json());
app.use(cookieParser(process.env.SECRET_JWT)); // this must be before any routes

// data sanitizeation againse nosql query injection
// like login without email using qeury injection like email {$gte:""}
// it removers all dollar sigbs and dots coz this is how mongo query works
//it looks at req.body and query and req.paramse and remove . $
app.use(mongoSanitize());

// data sanitizeation againse xss attack like user can enter html code in a name
//so it tern this html like div to html entity
app.use(xss());

// Preventing Parameter Pollution
app.use(
  hpp({
    // it means if there is 2 sort like sort=price$sort=ratingsAverage.
    // when we have 2 sort then i will have array and i can not use split on array
    //here i make  sort to be a array and after that make it string using join
    //but what happend is it will take the ratingsAverage and price and put them in array so can not use split on array
    //it works on string to make them array . so hpp takes the last value which is ratingsAverage
    // use whitelist to just take these filds  as a dublicate means i can use company many time so use whitelist
    whitelist: ["price", "name", "company", "ratingsAverage", "category"],
  })
);

app.use("/v1", limiter);
app.use("/v1", api);

app.all("*", (req, res, next) => {
  /* return res.status(404).json({
    status: "fail",
    message: "Rouut is not exits",
  });*/

  // this code used with express handle errors
  //const err = new Error("Rouut is not exits");
  //err.statusCode = 404; // Not found
  //err.status = " Fail";
  // pass this error to the global express using next
  //next(err);
  return next(new appError("Rouut is not exits!", 404));
});

app.use(globalErrorHnadling);

// Express globla middle ware. send the error to the global to exexute the error using err object
/*
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";
  return res.status(err.statusCode).json({
    status: err.status,
    msg: err.message,
  });
});
*/
module.exports = app;
