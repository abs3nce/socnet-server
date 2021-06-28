const express = require("express");
const app = express();

app.get("/", (req, res, next) => {
  res.send("Welcome home!");
});

port = 3000;

app.listen(port);
