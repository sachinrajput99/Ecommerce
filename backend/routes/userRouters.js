const express = require("express");
const userRouter = express.Router();



// handlers 
const getAllUsers = (req, res) => {
  res.send("GET all users route");
};

const createUser = (req, res) => {
  res.send("POST create user route");
};

const getUser = (req, res) => {
  res.send(`GET user route with ID: ${req.params.id}`);
};

const updateUser = (req, res) => {
  res.send(`PATCH update user route with ID: ${req.params.id}`);
};

const deleteUser = (req, res) => {
  res.send(`DELETE user route with ID: ${req.params.id}`);
};

// Users routes
userRouter.route("/api/v1/users").get(getAllUsers).post(createUser);

userRouter
  .route("/api/v1/users/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);


//   handlers 

  module.exports=userRouter