const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product must have a name"],
      trim: true,
      unique: true,
      maxlength: [100, "Name must have 100 characters max"],
    },

    sku: {
      type: String,
      required: [true, "A product must have a SKU"],
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "A product must have a description"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "A product must belong to a category"],
      enum: [
        "electronics",
        "clothing",
        "beauty",
        "home",
        "sports",
        "books",
        "others",
      ],
    },

    price: {
      type: Number,
      required: [true, "A product must have a price"],
      min: [0, "Price must be above 0"],
    },

    quantityInStock: {
      type: Number,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
