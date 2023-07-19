class appError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith("4") ? "Fail" : "Error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
    /*The stack trace is a representation of the sequence of function calls that led to the error.
     It provides valuable information about the execution flow, showing which functions were called and in what order. 
    The stack trace is useful for debugging and understanding the context in which an error occurred.*/
  }
}

/*
function test(req, res, next) {
  // if there is an error use next to call the express handle error and send the error obj to it
  return next(new appError("msg", 400));
}
*/

module.exports = appError;
