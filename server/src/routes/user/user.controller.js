const {
  SignupUser,
  GetAllUsers,
  DeleteMe,
  UpdateMe,
  findOnerUser,
  findByCredentials,
} = require("../../models/user.models");

const appError = require("../../services/error.global.express");
const sendCookieToRespond = require("../../auth/cookie");
const { filterObj } = require("../../services/servicesFunctions");
const Email = require("../../services/email");
const crypto = require("crypto");
const UserService = require("../../services/user.services");

async function httpLogIn(req, res, next) {
  const userDate = req.body;
  const user = await UserService.LoginUser(userDate, next);
  if (!user) {
    return;
  }
  sendCookieToRespond(user, res);
  return res.status(201).json({
    status: "sucess",
    data: {
      user,
    },
  });
}

async function httpSignupUser(req, res, next) {
  const user = req.body;
  const newUser = await SignupUser(user);
  sendCookieToRespond(newUser, res);
  return res.status(201).json({
    status: "sucess",
    data: {
      user: newUser,
    },
  });
}

async function httpGetAllUsers(req, res, next) {
  const users = await GetAllUsers();

  return res.status(200).json({
    status: "sucess",
    data: {
      results: users.length,
      users,
    },
  });
}
async function httpGetMe(req, res, next) {
  const user = req.user;
  return res.status(200).json({
    status: "sucess",
    data: {
      user,
    },
  });
}
async function httpDeleteMe(req, res, next) {
  await DeleteMe(req.user._id);
  return res.status(200).json({
    status: "Account has been deleted",
  });
}

async function httpUpdateMe(req, res, next) {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      appError(
        "Can not update password and passwordConfirm in this router",
        400
      )
    );
  }

  const filter = filterObj(req.body, "name", "email"); // used ... to make email and name in array
  const updatedUser = await UpdateMe(req.user._id, filter);
  return res.status(200).json({
    status: "sucess",
    user: updatedUser,
  });
}

async function httpfindOnerUser(req, res, next) {
  const { id } = req.params;
  const user = await findOnerUser({ _id: id });
  if (!user) {
    return next(new appError("User is not found", 400));
  }
  return res.status(200).json({
    status: "sucess",
    data: {
      user,
    },
  });
}

/////////////////// Passwords

async function httpForgotPassword(req, res, next) {
  // get Email
  if (!req.body.email) {
    return next(new appError("Please provide email", 400));
  }
  const user = await findOnerUser({ email: req.body.email });
  if (!user) {
    return next(new appError("User is not exits", 400));
  }

  const resetToken = await user.generateResetToken();
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordreset();
    return res.status(200).json({
      status: "success",
      message: "token send to email",
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetTokenExpiresIn = undefined);
    await user.save({ validateBeforeSave: false });
    return next(new appError("there was an error please try again", 500));
  }
}

async function httpReserPassword(req, res, next) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await findOnerUser({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresIn: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new appError("Invalid token or expired, please try again", 400)
    );
  }
  // if i did not pass password and password confirm then here they will be saved as a null or undefined
  // so once i use save it will validate all required fileds and see password and pass confirm do not have values
  // sp throw an error

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresIn = undefined;
  await user.save(); // here use mongoose middleware to update password changed at now
  // and not use validateBeforeSave coz all required filed will be checked
  sendCookieToRespond(user, res);
  return res.status(200).json({
    status: "success reset password",
  });
}

async function httpUpdateCurrentPassword(req, res, next) {
  const user = req.user;
  const { currentpassword } = req.body;
  if (!currentpassword) {
    return next(new appError("Provide current password", 400));
  }

  const isMatch = await user.comparePassword(currentpassword, user.password);
  if (!isMatch) {
    return next(new appError("password is not correct", 400));
  }

  // Remember if passwordConfirm has not data here, i will throw an error coz when i save user i made passwordConfirm undefined
  // so when i use save it will run all validatores and see that passwordConfirm has no value  so throw an error
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  sendCookieToRespond(user, res);
  return res.status(200).json({
    status: "password has been updated",
  });
}

//////////////

function httpLogout(req, res) {
  res.cookie("token", "Logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  if (process.env.NODE_ENV === "development") {
    return res.status(200).json({
      status: "success",
      message: "You loged out",
    });
  }
}

module.exports = {
  httpSignupUser,
  httpLogIn,
  httpGetAllUsers,
  httpGetMe,
  httpDeleteMe,
  httpUpdateMe,
  httpfindOnerUser,
  httpLogout,
  httpForgotPassword,
  httpReserPassword,
  httpUpdateCurrentPassword,
};
