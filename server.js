//package
const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const cors = require("cors");
dotenv.config();

//database
mongoose
  .connect(process.env.DB_CONN, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`DB > CONNECTION SUCCESSFUL`);
  });
mongoose.connection.on("error", (err) => {
  console.log(`DB > CONNECTION ERROR: ${err.message}`);
});

//routes import
const postRoutes = require("./routes/route_post");

//middleware
app.use(express.json());
app.use(morgan("dev"));

//routes
//funguju ako middleware, pri accessnuti "/" presmeruju na routes_post
app.use("/", postRoutes);

//port a express listening
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`API > LISTENING ON PORT: ${port}`);
});
