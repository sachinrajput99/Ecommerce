const express = require("express");
const {
  getAllUsers,
  createUser,
  updateUser,
  getUser,
  deleteUser,
} = require("../controller/userController");
const authController = require("../controller/authController");
const userRouter = express.Router();

userRouter.route("/signup").post(authController.signUp);
userRouter.route("/login").post(authController.protect, authController.login);

userRouter.route("/forgotPassword").post(authController.forgotPassword);
userRouter.route("/resetPassword").post(authController.resetPassword);

// Users routes
userRouter.route("/").get(getAllUsers).post(createUser);

userRouter
  .route("/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    deleteUser
  );

//   handlers

module.exports = userRouter;
