const express = require("express");
const {
  getAllUsers,
  createUser,
  updateUser,
  getUser,
  deleteUser,
} = require("../controller/userController");
// authentication route
const authController = require("../controller/authController");
const userRouter = express.Router();

userRouter.route("/signup").post(authController.signUp);
userRouter.route("/login").post(authController.protect, authController.login);

userRouter.route("/forgotPassword").post(authController.forgotPassword);
userRouter.route("/resetPassword/:id").post(authController.resetPassword);

// /me operations
userRouter
  .route("/updatePassword")
  .patch(authController.protect, authController.updatePassword);

userRouter
  .route("/updateMe")
  .patch(authController.protect, authController.updateMe);



  userRouter.route("/deleteMe").post(authController.protect, authController.deleteMe);
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
