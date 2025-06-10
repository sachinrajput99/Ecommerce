const express = require("express");

const {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  // checkId,
  checkProperty,
  aliasTopProducts,
  getProductStats,
} = require("../controller/productController");
const productRouter = express.Router();

// params middleware
// productRouter.param("id", checkId);

// tour routes

// new way
// aggreagation pip line route
productRouter.route("/product-stats").get(getProductStats);
// alias route
productRouter.route("/top-5-products").get(aliasTopProducts, getAllProducts);

// products (get all products ot based on query)
productRouter.route("/").get(getAllProducts).post(createProduct);

productRouter
  .route("/:id")
  .get(getProduct)
  .patch(updateProduct)
  .delete(deleteProduct);

module.exports = productRouter;
