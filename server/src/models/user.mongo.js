/*In the context of JWT (JSON Web Tokens), the term "stateless" refers to the lack of server-side state 
required to validate and process the token.

Stateless authentication means that the server does not store any session data or information about the 
authenticated user. With JWT, all the necessary information to authenticate and authorize a user is contained 
within the token itself. The server can validate and process the token without needing to consult a session store or database.

When a user logs in and authenticates successfully, a JWT is issued and sent to the client (usually in the 
  form of an HTTP header or a cookie). The client includes the JWT in subsequent requests to the server for
   authentication and authorization purposes. The server then verifies the authenticity and integrity of the
    JWT using the secret key or public key, without needing to query a database or session store.

The statelessness of JWT provides several benefits, including scalability, reduced server-side storage requirements,
 and the ability to easily implement distributed systems. However, it's important to ensure the security of the JWT 
 by using secure algorithms, protecting the secret key or public key, and validating the token's signature to prevent 
 tampering or unauthorized access.
 
 //////////
once the user sign in i will send a token to his cookies
this token is about header, payloads and original signautre
this token created using the token that made by JWT using the headers and the payloads lets that it is the
 id of the user and the secret that jwt has 
so in the user cookies there will be an original segnature so once the user make a request to the server
the server will verify the token using its header and payload with the secret in the server and create test signature 
and compare it with the original segnautre that is in the cookies ?
ChatGPT

Yes, you have described the basic flow of how JWT works. Here's a step-by-step breakdown:

    User signs in: When the user successfully authenticates, the server generates a JWT (JSON Web Token).

    Token generation: The JWT consists of three parts: a header, a payload, and a signature. The header contains 
    information about the algorithm used for signing the token. The payload contains claims or information about the user
    , such as the user's ID or role. The server signs the header and payload with a secret key or private key to create the signature.

    Token sent to client: The server sends the JWT to the client, typically as an HTTP response in the form of a cookie 
    or an Authorization header.

    Client includes token in requests: For subsequent requests to the server, the client includes the JWT in the request,
     typically in the form of an Authorization header with the value "Bearer <token>" or as a cookie.

    Server verifies and processes the token: Upon receiving a request, the server extracts the JWT from the request heade
    r or cookie. It then verifies the authenticity and integrity of the token by recreating the signature using the header, 
    payload, and the server's secret key or public key. If the signatures match, the server can trust the information in the token.

    Access control and authorization: The server uses the information in the payload to determine the identity and authorization 
    level of the user. It can access the user's ID, roles, or other relevant data to authorize or deny access to protected resources.

By comparing the recreated signature with the original signature in the token, the server can ensure that the token has not been
 tampered with. The server's secret key or public key is crucial for validating the token's signature and ensuring its integrity.

It's important to note that the server should securely store the secret key or manage the public key, and the JWT should be 
transmitted over secure channels (e.g., HTTPS) to prevent interception or modification. Additionally, JWTs have an expiration 
time (specified in the payload), and the server should check the token's expiration to ensure it is still valid.
 
 */

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have a name"],
      trim: true,
      minlength: [3, "Invalid user name. Minimum 3 characters required."],
      maxlength: [20, "Invalid user name. Maximum  3 characters required."],
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [8, " password  must have more or equal than 8 chars"],
      //select:false,// Dont return the password
    },

    passwordConfirm: {
      type: String, // this just work with save and create, this is why i handle reset password and update it in dif routes to use save
      required: [true, "passwordConfirm is required"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "password and passwordConfirm must be equal",
      },
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Email is required"],
      validate: [validator.isEmail, "please provide a valid email"],
    },

    role: {
      type: String,
      default: "user",
      enum: {
        values: ["user", "guide"],
        message: "Role must be user or guide",
      },
    },
    passwordResetToken: String,
    passwordResetTokenExpiresIn: Date,
    passwordChangedAt: Date,
    active: {
      type: Boolean,
      default: true,
    },
    unlockLoginTime: Date,
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//passwordConfirm is required so the user must write it, but its not must to be persisted in the database
// so save works after the info pass all validation and before store it in the database i can maake passwordConfirm undefined

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next;
  user.password = await bcrypt.hash(user.password, 12);
  user.passwordConfirm = undefined;
  return next();
});

// use methodes mean this function can ba attached to each instant or each  document created

userSchema.methods.generateAuthToken = function () {
  const user = this;
  //  const token = jwt.sign({ _id: user._id  , _role: user.role}, process.env.SECRET_JWT, {

  const token = jwt.sign({ _id: user._id }, process.env.SECRET_JWT, {
    expiresIn: process.env.EXPIRES_IN,
  });
  return token;
};

// use statics means use it on the models it slef which us User
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    return false;
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return false;
  }

  return user;
};

// methods works on the user not User
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.generateResetToken = async function () {
  const user = this;
  const resetToken = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;
  /* In the middleware function, you are setting user.passwordConfirm to undefined when 
  the password is modified. This effectively
   removes any value that might have been assigned to user.passwordConfirm before the save operation. As a result,
    when you subsequently call save() on the user instance, Mongoose considers the passwordConfirm field as not 
    having a value, triggering the required field validation error.

On the other hand, the password and name fields do not have this specific logic in
 the middleware function, so their values remain intact, and Mongoose can perform the required field validation successfully.
   */
  await user.save({ validateBeforeSave: false }); // to stop all validation
  //summary when i use save, mongo will check all values required values like name password ets
  // but when check password confirm it will be undefined so it will thorw an error
  return resetToken;
};

userSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.passwordResetToken;
  delete userObj.passwordResetTokenExpiresIn;
  delete userObj.active;
  delete userObj.failedLoginAttempts;
  return userObj;
};

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  return next();
});
const User = mongoose.model("User", userSchema);
module.exports = User;
