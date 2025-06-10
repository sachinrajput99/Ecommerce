const mongoose = require("mongoose");
const app = require("./app");
const PORT = process.env.PORT || 8000;



mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("mongo db is connected"))
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

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
