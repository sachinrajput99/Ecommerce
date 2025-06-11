// is class ka kaam h error banana 

class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Parent Error class ka constructor call
    this.statusCode = statusCode;

    // Status set karte based on statusCode
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // Yeh flag dikhata hai ki yeh expected error hai
    this.isOperational = true;

    // Stack trace ko capture karte, jisse debug karna easy ho
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
