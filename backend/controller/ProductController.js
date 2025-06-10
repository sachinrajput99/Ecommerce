const qs = require("qs");
const ProductModel = require("../model/ProductModel");
const APIFeatures = require("../utils/apifeatures");

exports.aliasTopProducts = (req, res, next) => {
  req.query.page = 1;
  req.query.limit = 5;
  req.query.fields = "name,price,ratingsAverage,description";
  next();
};

// product handles
exports.createProduct = async (req, res) => {
  try {
    console.log(req.body);

    const Product1 = await ProductModel.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        tour: Product1,
      },
    });
  } catch (err) {
    console.log(`error in create product ${err}`);
    res.status(400).json({ status: "Failed", message: "Invalid data " });
  }
};

// exports.getAllProducts = async (req, res) => {
//   // const params = req.params.id * 1;
//   try {

//     // const products = await ProductModel.find();
//     console.log(req.query);

//     const queryObj = { ...req.query };
//     const excludedFields = ["page", "sort", "limit", "fields"];
//     // console.log(queryObj);

//     excludedFields.forEach((el) => delete queryObj[el]);
//     // console.log(queryObj);

//    const product= await ProductModel.find()

//     res.status(200).json({
//       status: "success",
//       result: product.length,
//       data: { product },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "failed",
//       message: error,
//     });
//   }
// };

exports.getAllProducts = async (req, res) => {
  try {
    // Use qs.parse to correctly structure nested query params
    const parsedQuery = qs.parse(req.query);

    // EXECUTE QUERY
    const features = new APIFeatures(ProductModel.find(), parsedQuery)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //execution query
    const product = await features.query;

    res.status(200).json({
      status: "success",
      result: product.length,
      data: { product },
    });
  } catch (error) {
    // console.log(error);

    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const params = req.params.id;
    // Model.findById(params)

    const product = await ProductModel.findById(params);
    // console.log(product);

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const params = req.params.id;

    console.log(req.params);
    const product = await ProductModel.findByIdAndUpdate(params, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ status: "success", message: "product deleted success fully" });
  } catch (error) {
    res.status(200).json({ message: error });
  }
};
exports.getProductStats = async (req, res) => {
  try {
    const stats = await ProductModel.aggregate([
      {
        $match: { price: { $gte: 1000 } }, //find ki trah hota hai
      },
      {
        $group: {
          //grouping make group
          _id: "$category",
          numProducts: { $sum: 1 },

          avgPrice: { $avg: "$price" }, //operators h avg.min
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 }, // Ascending order mein sort by avg price
      },
      {
        $match: { avgPrice: { $gte: 5000 } }, //again filter
      },
    ]);

    res.status(200).json({
      status: "success",
      data: { stats },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};
