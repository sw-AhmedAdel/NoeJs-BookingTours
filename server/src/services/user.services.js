const appError = require("../services/error.global.express");
const { findByCredentials, findOnerUser } = require("../models/user.models");
const { lockUserLogin, unlockLoginTimeFun } = require("./user.repo");

class UserService {
  static async LoginUser(body, next) {
    const { email, password } = body;
    if (!email || !password) {
      return next(new appError("Eamil and Password must be provied", 400));
    }
    let user = await findOnerUser({ email });

    if (!user) {
      return next(new appError("User is not found", 400));
    }
    const comparePassword = await user.comparePassword(password, user.password);
    if (!comparePassword) {
      return await lockUserLogin(user, next);
    }
    return await unlockLoginTimeFun(user, next);
  }
}
module.exports = UserService;
/*    let user = await findByCredentials(email, password);
    if (!user) {
      user = await findOnerUser({ email });
      if (!user) {
        return next(new appError("User is not found", 400));
      }

      return await lockUserLogin(user, next);
    }
*/
