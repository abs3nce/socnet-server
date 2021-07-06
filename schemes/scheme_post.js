const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },

  image: {
    data: Buffer, //binary data format
    contentType: "String",
  },

  postedBy: {
    type: ObjectId, //userid
    ref: "User", //referencujeme User schemu
  },

  created: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Post", postSchema);
