const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: "Title is required", maxLength: 150 },
  body: { type: String, required: "Body is required", maxLength: 1500 },
});

module.exports = mongoose.model("Post", postSchema);
