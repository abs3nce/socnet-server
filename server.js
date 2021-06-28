//package
const express = require("express");
const app = express();
const morgan = require("morgan");

//routes import
const postRoutes = require("./routes/route_post");

//middleware
app.use(morgan("dev"));

//routes
//funguju ako middleware, pri accessnuti "/" presmeruju na routes_post
app.use("/", postRoutes);

//port a express listening
port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API > LISTENING ON PORT: ${port}`);
});
