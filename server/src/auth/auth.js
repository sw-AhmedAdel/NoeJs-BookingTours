const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { findOnerUser } = require("../models/user.models");
const appError = require("../services/error.global.express");

async function auth(req, res, next) {
  let token = "";
  if (req.signedCookies.token) {
    token = req.signedCookies.token;
  }
  if (!token) {
    return next(new appError("Please signup or login in to get access", 401));
  }
  //jwt.verify it recevies a callback function so i can put the token but i can use promisify to make it as promise
  const decoded = await promisify(jwt.verify)(token, process.env.SECRET_JWT);
  const user = await findOnerUser({
    _id: decoded._id,
  });
  if (!user) {
    return next(new appError("User is not longer exits"));
  }

  /* const changedPassword = user.checkChangedPassword(decoded.iat);
  if (changedPassword) {
    return next(new appError("You changed ur password please login", 401));
  }*/

  req.user = user;
  next();
}

// send string to this fun, so use ... to make it array
const restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new appError("You dont have permission to do that", 403));
    }
    next();
  };
};

module.exports = {
  auth,
  restrictedTo,
};
