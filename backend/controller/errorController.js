const AppError = require("../utils/appError");

const handleCastErrorDB = (error) => {
  // err.path = konsa field invalid tha (jaise 'id')
  // err.value = client ne kya galat value bheji

  const message = `invalid ${error.path}:${error.value}`;
  // Custom AppError bana ke return kar diya
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // value is array of values in ""
  // Mongo error message se quoted string nikalna
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  //   console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  // AppError return karo (400 = Bad Request)
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // err.errors ek object hai jisme har field ka error object hota hai
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;

  // Custom AppError bana ke return kar diya
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error("ERROR 💥", err);

    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    if (error.name == "castError") {
      const error = handleCastErrorDB(error);
    }
    if (error.code == 11000) {
      const error = handleDuplicateFieldsDB(error); // duplicate value error handle
    }
    if (error.name == "validationError") {
      const error = handleValidationErrorDB(error);
    }
    if (error.name == "JsonWebTokenError") {
       error = new AppError("Invalid token. Please log in again!", 401);
    }
    if (err.name == "TokenExpiredError") {
       error = new AppError(
        "Your token has expired! Please log in again.",
        401
      );
    }

    sendErrorProd(error, res); // human-friendly response
  }
};
