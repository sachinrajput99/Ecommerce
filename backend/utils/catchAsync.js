const catchAsync = (fn) => {
  // .catch block sends the error to the global error handling app.use(error,req,res,next) middleware if there is any error in fn(req,res,next) which is coming as a parameter in catchAsync

  // return a new function which is actually trigged as soon as our route is hit from frontend / post man
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
module.exports = catchAsync;
