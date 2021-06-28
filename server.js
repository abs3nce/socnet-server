//package
const express = require("express");
const app = express();
const morgan = require("morgan");

//routes import
const { getPosts } = require("./routes/route_post.js");

//middleware
app.use(morgan("dev"));

//routes
app.get("/", getPosts);

//port a express listening
port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API > LISTENING ON PORT: ${port}`);
});
