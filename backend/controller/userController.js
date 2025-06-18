const UserModel = require("../model/UserModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// usersController.js
exports.getAllUsers = async function (req, res) {
  const users = await UserModel.find();
  res.status(200).json({
    status: "success",
    users,
  });
};

exports.getUser = function (req, res) {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

exports.createUser = function (req, res) {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

exports.updateUser = function (req, res) {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

exports.deleteUser = catchAsync(async function (req, res) {


  const deletedUser = await UserModel.findByIdAndDelete(req.user._id);
  if (!deletedUser) next(new AppError("user is not deleted", 500));

  
  res.status(200).json({
    status: "success",
    deletedUser,
    message: "user deleted successfully!",
  });
});
