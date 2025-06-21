const UserModel = require("../model/UserModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// sending response with token

const createToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV == "production") cookieOptions.secure = true;

  // sending cookie in header
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  // send response
  res.status(statusCode).json({
    status: "success",
    token,

    data: {
      user: newUser,
    },
  });
};

// filtered Body
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const signToken = (id) => {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });

  return token;
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create(req.body);

  createToken(newUser, 200, res);

  // sending response

  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRE,
  // });

  // res.status(200).json({
  //   status: "success",
  //   token,

  //   data: {
  //     user: newUser,
  //   },
  // });
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
  // console.log(req.headers);

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
  // 1.get user based on email

  const { email } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) return next(new AppError("please provide valid email", 400));

  // 2.generate reset token

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3. Build reset URL dynamically
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

  // 4. Create message
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn’t forget your password, please ignore this email!`;

  // 5. Send email
  try {
    await sendEmail({
      email,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});
exports.resetPassword = async (req, res, next) => {
  // hashing the password so as to compare in db(db contains hashed password)
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  //  Find User by Hashed Token and Check Expiry
  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if no user found
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // Step 4: Set New Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  //step5 : Reset token aur expiry hata do
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // ✅ Step 6: Save Updated User (Triggers pre-save hook for hashing)
  await user.save(); // validators run honge, encryption bhi ho jayega

  // ✅ Step 7: Log the User In (Send New JWT)
  const token = signToken(user._id); // your JWT sign function

  res.status(200).json({
    status: "success",
    token,
  });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get user from collection
  // console.log(req.user);

  const user = await UserModel.findById(req.user._id).select("+password");
  //2) check if posted current password is correct

  const isPasswordMatched = await user.comparePassword(
    req.body.passwordCurrent,
    user.password
  );

  if (!isPasswordMatched) {
    return next(new AppError("your current password is wrong", 401));
  }
  //3) if so , update password

  user.password = req.body.password;
  user.confirmPassword = req.body.passwordConfirm;
  await user.save();
  //4) login user, send JWT

  const token = signToken(user._id);

  return res.status(200).json({
    status: "success",
    data: { user },
    token,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1)create error if password is provided
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This routes is not for password. please use /updatePassword",
        400
      )
    );
  }
  // 2)//remove unnecessary field like role:admin in present in req.body

  const filteredObject = filterObj(req.body, "name", "email");
  //3)update user document
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user.id,
    filteredObject,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: { updatedUser },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // This assumes req.user is populated by a previous auth middleware (e.g. after JWT verification).
  console.log(req.user);

  const user = await UserModel.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  // send response
  res.status(200).json({
    status: "success",
    data: null,
  });
});
