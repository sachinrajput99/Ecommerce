const fs = require("fs");
const mongoose = require("mongoose");
const Product = require("../model/ProductModel");
require("dotenv").config();
const slugify = require("slugify");

const dummyProducts = [
  {
    name: "Smartphone XZ Pro1 Max",
    slug: slugify("Smartphone XZ Pro Max", { lower: true }),
    sku: "XZPROMAX001",
    category: "electronics",
    description: "High-end flagship smartphone with AI camera.",
    price: 54999,
    quantityInStock: 25,
    imageCover: "smartphone-cover.jpg",
    images: ["smartphone1.jpg", "smartphone2.jpg"],
    ratingsAverage: 4.8,
    active: true,
  },
  {
    name: "Cotton Kurta for Men",
    slug: slugify("Cotton Kurta for Men", { lower: true }),
    sku: "KURTA1001",
    category: "clothing",
    description: "Comfortable cotton kurta for daily wear.",
    price: 799,
    quantityInStock: 120,
    imageCover: "kurta-cover.jpg",
    images: ["kurta1.jpg"],
    ratingsAverage: 4.2,
    active: true,
  },
  {
    name: "Herbal Face Wash",
    slug: slugify("Herbal Face Wash", { lower: true }),
    sku: "FACEWASH1002",
    category: "beauty",
    description: "Gentle herbal face wash for glowing skin.",
    price: 299,
    quantityInStock: 70,
    imageCover: "facewash-cover.jpg",
    images: ["facewash1.jpg"],
    ratingsAverage: 4.6,
    active: true,
  },
  {
    name: "Ergonomic Office Chair",
    slug: slugify("Ergonomic Office Chair", { lower: true }),
    sku: "CHAIR3001",
    category: "home",
    description: "Comfortable office chair with back support.",
    price: 7999,
    quantityInStock: 40,
    imageCover: "chair-cover.jpg",
    images: ["chair1.jpg", "chair2.jpg"],
    ratingsAverage: 4.7,
    active: true,
  },
  {
    name: "Fitness Tracker Watch",
    slug: slugify("Fitness Tracker Watch", { lower: true }),
    sku: "WATCH4001",
    category: "electronics",
    description: "Smartwatch with health tracking features.",
    price: 2499,
    quantityInStock: 60,
    imageCover: "watch-cover.jpg",
    images: ["watch1.jpg"],
    ratingsAverage: 4.3,
    active: true,
  },
  {
    name: "Sports Water Bottle",
    slug: slugify("Sports Water Bottle", { lower: true }),
    sku: "BOTTLE5001",
    category: "sports",
    description: "BPA-free water bottle for athletes.",
    price: 499,
    quantityInStock: 180,
    imageCover: "bottle-cover.jpg",
    images: ["bottle1.jpg"],
    ratingsAverage: 4.4,
    active: true,
  },
  {
    name: "Classic Leather Wallet",
    slug: slugify("Classic Leather Wallet", { lower: true }),
    sku: "WALLET6001",
    category: "others",
    description: "Premium quality genuine leather wallet.",
    price: 999,
    quantityInStock: 90,
    imageCover: "wallet-cover.jpg",
    images: ["wallet1.jpg"],
    ratingsAverage: 4.5,
    active: true,
  },
  {
    name: "Noise Cancelling Earbuds",
    slug: slugify("Noise Cancelling Earbuds", { lower: true }),
    sku: "EARBUDS7001",
    category: "electronics",
    description: "Compact earbuds with deep bass & ANC.",
    price: 3499,
    quantityInStock: 45,
    imageCover: "earbuds-cover.jpg",
    images: ["earbuds1.jpg"],
    ratingsAverage: 4.6,
    active: true,
  },
  {
    name: "Women’s Handbag Set",
    slug: slugify("Women’s Handbag Set", { lower: true }),
    sku: "HANDBAG8001",
    category: "others",
    description: "Stylish handbag set for daily use.",
    price: 2199,
    quantityInStock: 35,
    imageCover: "handbag-cover.jpg",
    images: ["handbag1.jpg"],
    ratingsAverage: 4.7,
    active: true,
  },
  {
    name: "Kids Educational Toy",
    slug: slugify("Kids Educational Toy", { lower: true }),
    sku: "TOY9001",
    category: "others",
    description: "Interactive toy that promotes learning.",
    price: 1299,
    quantityInStock: 110,
    imageCover: "toy-cover.jpg",
    images: ["toy1.jpg"],
    ratingsAverage: 4.8,
    active: true,
  },
];

mongoose
  .connect(process.env.DATABASE, {})
  .then(() => {
    console.log("DB connected");
    // return Product.insertMany(dummyProducts);
  })
  .catch(() => {
    console.log("Dummy products imported successfully!");
    mongoose.disconnect();
  });
// const importData = async () => {
//   try {
//     await Product.create(dummyProducts);
//     console.log("Data successfully loaded!");
//     process.exit();
//   } catch (err) {
//     console.error(err);
//   }
// };

const importData = async () => {
  try {
    await Product.deleteMany(); // 👈 Yeh line data clean karegi
    await Product.insertMany(dummyProducts); // Fir naya data daalo
    console.log("✅ Data successfully loaded!");
  } catch (err) {
    console.error("❌ Import error:", err);
  } finally {
    mongoose.disconnect();
  }
};

const deleteData = async () => {
  try {
    await Product.deleteMany(); // 👈 Yeh line data clean karegi
    await Product.deleteMany();
    console.log("Data successfully deleted!");
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
