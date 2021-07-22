//base packages import
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

//vytvorenie noveho modelu pre post
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
    /*
    Buffer: 
    Raw data is stored in instances of the Buffer class. 
    A Buffer is similar to an array of integers but corresponds 
    to a raw memory allocation outside the V8 heap. 
    'ascii'|'utf8'|'utf16le'|'ucs2'|'base64'|'binary'|'hex'
    */
  },

  postedBy: {
    type: ObjectId, //userid
    ref: "User", //referencujeme inu schemu >> User model
    /*
    objectId:
    typ objectId je napriklad aj bezne _id ktore je generovane pri kazdom objekte
    v mongodb databaze, je to proste specialnyt typ integeru a vola sa objectId */
  },

  created: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Post", postSchema);
