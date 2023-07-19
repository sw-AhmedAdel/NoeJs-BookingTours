function sendCookieToRespond(user, res) {
  const token = user.generateAuthToken();
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in milliseconds
    httpOnly: true, //property is set to true, which ensures that the cookie is only accessible via HTTP(S) and not
    // through client-side JavaScript. This enhances security by preventing cross-site scripting (XSS) attacks.
    signed: true, // indicating that the cookie value will be signed using a secret key. This helps to ensure the
    //integrity of the cookie and detect any tampering attempts.
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
    //property is set to true if the application is running in a production environment. This instructs the client to only send the cookie over a
    //secure HTTPS connection, providing an extra layer of security.
  }
  res.cookie("token", token, cookieOptions);
}

/* 
 ' httpOnly mean access by browser
  secure: means using https for security and encryption
  signed mean sign the cooke by send the jwt secret

 */

module.exports = sendCookieToRespond;
