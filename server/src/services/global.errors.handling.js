const appError = require("./error.global.express");

// here i dont use next coz use next with async fun to pass the error to the global express error
// but here send the error to the global direct and the error happend from mongo

class MongooseError {
  static handleDublicateValues(error) {
    const message = `This value: ${Object.values(
      error.keyValue
    )} already exists.`;
    return new appError(message, 400);
  }
  static handelValidationError(error) {
    // loop throw each obj
    const errors = Object.values(error.errors).map((err) => err.message);
    const message = `Invalid Errors: ${errors.join(". ")}`; // make array string
    return new appError(message, 400);
  }

  static handleInvalidMongoId(error) {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new appError(message, 400);
  }
}

class JsonWebTokenError {
  static JsonWebTokenError() {
    const message = "Token is invalid, Please login or signup";
    return new appError(message, 401);
  }

  static handelJwtExpired() {
    const message = "Token is expired, please login";
    return new appError(message, 401);
  }
}

function sendErrorDev(err, res) {
  // Send me the error in the dev
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err,
    stack: err.stack,
  });
}

function sendErrorProd(err, res) {
  // Send error in production in meaningful way
  if (err.isOperational) {
    // It means the error i handeled it myself
    return res.status(err.statusCode).json({
      status: err.status,
      msg: err.message,
    });
  }
  console.error("Error: ", err);
  return res.status(err.statusCode).json({
    status: err.status,
    msg: "Server is down, Please try again later",
  });
}

function globalErrorHnadling(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // Error for wrong id
    let error = Object.assign(err);

    if (error.name === "CastError") {
      error = MongooseError.handleInvalidMongoId(error);
    }

    // handle dublicate values using unique: true
    if (error.code === 11000 && error.statusCode === 500) {
      error = MongooseError.handleDublicateValues(error);
    }

    //Handling Mongoose Validation Errors
    if (error.name === "ValidationError" && error.statusCode === 500) {
      error = MongooseError.handelValidationError(error);
    }

    if (
      error.name === "JsonWebTokenError" &&
      err.message === "invalid signature"
    ) {
      error = JsonWebTokenError.JsonWebTokenError();
    }

    if (err.message === "jwt expired") {
      error = JsonWebTokenError.handelJwtExpired();
    }
    sendErrorProd(error, res);
  }
}

module.exports = globalErrorHnadling;
