// <!-- get all products route after all pagination sort limiti  filetering 
//  -->


exports.getAllProducts = async (req, res) => {
  try {
    //1A) FILTERING

    // 1. Make a copy of query object
    console.log(req.query);
    //{
    //   'price[gte]': '100',
    //   'quantityInStock[lt]': '30',
    //   sort: '-price,-quantityInStock',
    //   fields: 'name,price,quantityInStock'
    // }
    const newQuery = qs.parse(req.query);
    //for api end point http://127.0.0.1:8000/api/v1/products?price[gte]=100&quantityInStock[lt]=30&sort=-price,-quantityInStock&fields=name,price,quantityInStock
    // console.log(newQuery);
    // {
    //   price: { gte: '100' },
    //   quantityInStock: { lt: '30' },
    //   sort: '-price,-quantityInStock',
    //   fields: 'name,price,quantityInStock'
    // }

    const queryObj = { ...newQuery }; //creating copy of  newQuery

    // 2. Remove reserved fields from query
    const excludedFields = ["page", "sort", "limit", "fields"];

    excludedFields.forEach((el) => delete queryObj[el]);

    // 3. Convert to string and handle operators like gte, lte, etc.
    let queryStr = JSON.stringify(queryObj);
    // console.log(queryStr);//{"price":{"gte":"100"},"quantityInStock":{"lt":"30"}}
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(queryStr);

    // 4. Build the query
    // const product = await  ProductModel.find(JSON.parse(queryStr));
    // for sorint
    let query = ProductModel.find(JSON.parse(queryStr));

    // 1B) SORTING

    // agr api end point m sort keyword hai to
    if (req.query.sort) {
      //  console.log(req.query.sort);//-price,-quantityInStock

      // sortBy = req.query.sort.split(",").join(" "); //http://127.0.0.1:8000/api/v1/products?price[gte]=00&sort=-price,-quantityInStock
      // console.log(sortBy); -price -quantityInStock

      const sortBy = req.query.sort.split(",").join(" ");
      // console.log(sortBy);

      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt"); // default
    }
    //execution query
    // const product = await query; //-price -quantityInStock or 👇
    // const product= await query.sort({price:-1,quantityInStock:-1})
    //
    // console.log(product);

    //3C limiting fields (by using select )

    if (req.query.fields) {
      // console.log(req.query.fields);//name,price,quantityInStock

      const fields = req.query.fields.split(",").join(" ");
      // console.log(fields);//name price quantityInStock

      query = query.select(fields);
    } else {
      query.select("-__v");
    }

    //4D pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const skip = (page - 1) * limit; //skip products or documents

    // adding pagination logic into our query
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const totalProducts = await ProductModel.countDocuments();
      console.log(totalProducts, skip);

      if (skip > totalProducts) throw new Error("this page does not exist");
    }

    //execution query
    const product = await query;

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
