const mongoose = require("mongoose");

// 💥 This must be placed at the top of your file (e.g., server.js)
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
// console.log(x);

const app = require("./app");
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.DATABASE)
  .then(async () => {
    // Drop the unique index on the "name" field
    // await mongoose.connection.db.collection("users").dropIndex("name_1");
    console.log("mongo db is connected");
  })
  .catch((err) => console.log(`error is ${err}`));

// const testTour = new Tour({
//   name: "forest hiker",
//   price: 600,
//   rating: 4,
// });
// testTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log("erro ", err));

const server = app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
// ➡️ Ye error Express ke bahar bhi ho sakta hai, jaise:
// MongoDB se connection fail ho jaana
// Kisi third-party API call ka fail ho jaana

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
