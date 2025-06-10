const express = require("express");
const morgan = require("morgan");
const {
  getUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("./controller/userController");

const userRouter = require("./routes/userRouters");
const productRouter = require("./routes/productRoutes");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 8000;

// Middleware

if (process.env.NODE_ENV == "development") {
  // yh code development m hi chlega

  app.use(morgan("dev"));
}
app.use(express.json()); //req.body k and r data dalega

app.use((req, res, next) => {
  console.log("hello from middleware");
  next();
});

// Routers
app.use("/api/v1/products", productRouter);
// app.use("/api/v1/users", userRouter);

// app.listen(process.env.PORT, () => {
//   console.log(`server is running on port ${PORT}`);
// });

app.use((req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `can't find ${req.originalUrl} on this server`,
  // });

  const err = `can't find ${req.originalUrl} on this server`;
  err.statusCode = 404;
  err.status = "fail";

  next(err);
});
// global error middle ware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 404;

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
