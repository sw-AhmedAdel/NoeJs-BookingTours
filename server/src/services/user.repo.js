const appError = require("../services/error.global.express");
const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME = 1 * 60 * 60 * 1000; // hour

function getRemaningMints(userDate) {
  return Math.floor((userDate - Date.now()) / (1000 * 60));
}
async function lockUserLogin(user, next) {
  user.failedLoginAttempts++;
  await user.save({ validateBeforeSave: false });
  if (
    user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS &&
    Date.now() > user.unlockLoginTime
  ) {
    user.failedLoginAttempts = 1;
    user.unlockLoginTime = Date.now() + LOCK_TIME;
    await user.save({ validateBeforeSave: false });
    return next(new appError("User is not found", 400));
  } else if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
    if (!user.unlockLoginTime) {
      user.unlockLoginTime = Date.now() + LOCK_TIME;
      await user.save({ validateBeforeSave: false });
    }
    return next(
      new appError(
        `Too many failed login attempts. Please try again after ${getRemaningMints(
          user.unlockLoginTime
        )} minutes.`,
        401
      )
    );
  } else {
    return next(new appError("User is not found", 400));
  }
}

async function unlockLoginTimeFun(user, next) {
  if (user.unlockLoginTime && user.unlockLoginTime > Date.now()) {
    return next(
      new appError(
        `Too many failed login attempts. Please try again after ${getRemaningMints(
          user.unlockLoginTime
        )} minutes.`,
        401
      )
    );
  } else if (user.unlockLoginTime && Date.now() > user.unlockLoginTime) {
    user.failedLoginAttempts = undefined;
    user.unlockLoginTime = undefined;
    await user.save({ validateBeforeSave: false });
  } else if (user.failedLoginAttempts) {
    user.failedLoginAttempts = 0;
    await user.save({ validateBeforeSave: false });
  }
  console.log(user.failedLoginAttempts);
  return user;
}

module.exports = {
  lockUserLogin,
  unlockLoginTimeFun,
};
