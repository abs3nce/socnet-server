//package
const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const expressValidator = require("express-validator");
const cookieParser = require("cookie-parser");
const fs = require("fs");
// const cors = require("cors");
dotenv.config();

//databaza - pripojenie a error handling
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
const postRoutes = require("./routes/route_posts");
const authRoutes = require("./routes/route_account");
const usersRoutes = require("./routes/route_users");

//base middleware
app.use(express.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(morgan("dev"));

//routes
//funguju ako middleware, pri accessnuti "/" presmeruju na routes_post
app.use("/", postRoutes);
app.use("/", authRoutes);
app.use("/", usersRoutes);

//dokumentacia
app.get("/", (req, res, next) => {
  fs.readFile("docs/apidocs.json", (err, data) => {
    if (err) {
      res.status(500).json({ error: err });
    }
    const docs = JSON.parse(data);
    res.status(200).json(docs);
  });
});

//funkcia express-jwt ktora handluje 'UnauthorizedError' a tak viem zmenit response json
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res
      .status(401)
      .json({ error: "User must be logged in to perform this action" });
  }
});

//port a express listening
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`API > LISTENING ON PORT: ${port}`);
});
