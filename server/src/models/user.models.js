const User = require("./user.mongo");

async function SignupUser(user) {
  const newUser = await User(user);
  await newUser.save();
  return newUser;
}

async function findByCredentials(email, password) {
  const user = await User.findByCredentials(email, password);
  return user;
}

async function GetAllUsers() {
  return await User.find({}, { __v: 0 });
}

async function DeleteMe(id) {
  await User.findByIdAndDelete(id, {
    active: false,
  });
}

async function UpdateMe(id, user) {
  const updatedUser = await User.findByIdAndUpdate(id, user, {
    new: true,
    runValidators: true,
  });
  return updatedUser;
}

async function findOnerUser(filter) {
  const user = await User.findOne(filter); //.select("+password"); to make password display just works with findone not find all
  return user;
}

module.exports = {
  SignupUser,
  findByCredentials,
  GetAllUsers,
  DeleteMe,
  UpdateMe,
  findOnerUser,
};
