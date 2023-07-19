const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // when i run functon and its async and there is an error this error will be catch
    // using catch above and pass the next to pass the error to express
  };
};
// body = req.body , array = email, string used ... to make it array
function filterObj(body, ...array) {
  const filter = {};
  Object.keys(body).forEach((el) => {
    if (array.includes(el)) {
      filter[el] = body[el];
    }
  });
  return filter;
}

function checkPermissions(requestUser, resouceUserID) {
  if (requestUser.role === "guide") return true;
  else if (requestUser._id.toString() === resouceUserID._id.toString())
    return true;
  else return false;
}

module.exports = {
  catchAsync,
  filterObj,
  checkPermissions,
};
