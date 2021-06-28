const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 8,
    maxLength: 150,
  },
  body: {
    type: String,
    required: true,
    minLength: 8,
    maxLength: 1500,
  },
});

module.exports = mongoose.model("Post", postSchema);
