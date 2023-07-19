const express = require("express");
const userRouter = express.Router();

// this is how i can use param like id
/*
userRouter.param("id", checkId);

function checkId(req, res, next, val) {
  if (val <= 0) {
    return res.status(400).json({
      error: "Invalid id",
    });
  }
  next();
}*/

const {
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
} = require("./user.controller");
const { catchAsync } = require("../../services/servicesFunctions");
const { auth, restrictedTo } = require("../../auth/auth");

userRouter.post("/signup", catchAsync(httpSignupUser));
userRouter.post("/login", catchAsync(httpLogIn));
userRouter.post("/forgotpassword", catchAsync(httpForgotPassword));
userRouter.patch("/resetpassword/:token", catchAsync(httpReserPassword));

userRouter.use(catchAsync(auth));

userRouter.get("/my/profile", catchAsync(httpGetMe));
userRouter.delete("/me", catchAsync(httpDeleteMe));
userRouter.patch("/updateme", catchAsync(httpUpdateMe));
userRouter.get("/logout", httpLogout);
userRouter.patch("/updatepassword", catchAsync(httpUpdateCurrentPassword));

userRouter.get("/", restrictedTo("guide"), catchAsync(httpGetAllUsers));
userRouter.get("/:id", restrictedTo("guide"), catchAsync(httpfindOnerUser));

module.exports = userRouter;
