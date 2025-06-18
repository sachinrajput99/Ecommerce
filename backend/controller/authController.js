const UserModel = require("../model/UserModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const signToken = (id) => {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });

  return token;
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create(req.body);
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.status(200).json({
    status: "success",
    token,

    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  console.log(email, password);

  if (!email || !password)
    return next(new AppError("Enter valid email and password", 400));

  const user = await UserModel.findOne({ email }).select("+password"); // ensure password is available

  if (!user) return next(new AppError("user not present", 400));

  // const isUserMatched = await user.comparePassword(password)

  const matched = await bcrypt.compare(password, user.password);

  if (!user || !matched)
    return next(new AppError("password  not matched", 400));
  // if (!user || !(await user.comparePassword(password)))

  const token = signToken(user._id);

  return res.status(200).json({
    status: "success",
    token,
    user: {
      user,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // getting the token

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log(req.headers);

  if (!token)
    return next(new AppError("You are not logged in ! please login", 400));

  // verify the token

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // check if user exist
  const freshUser = await UserModel.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  const isPasswordChanged = freshUser.changedPasswordAfter(decoded.iat);

  if (isPasswordChanged)
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  // ,

  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes("admin", "lead-guide")) {
      return next(new AppError("user do not have authority", 400));
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on email

  const { email } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) return next(new AppError("please provide valid email", 400));

  // generate reset token

  const token = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    status: "success",
    message: "Token sent to email!",
    token, // Remove this in production
  });

  // send reset token via email
});
exports.resetPassword = (req, res, next) => {};
