//base packages import
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const Schema = mongoose.Schema;

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
        /*
        objectId:
        typ objectId je napriklad aj bezne _id ktore je generovane pri kazdom objekte
        v mongodb databaze, je to proste specialnyt typ integeru a vola sa objectId 
        */
        type: ObjectId, //userid
        ref: "User", //referencujeme inu schemu >> User model
    },

    created: {
        type: Date,
        default: Date.now(),
    },

    updated: Date,

    likes: [{ type: ObjectId, ref: "User" }],

    exifData: {
        image: {
            Make: String,
            Model: String,
            ModifyDate: String,
            Artist: String,
        },
        exif: {
            ExposureTime: Number,
            FNumber: Number,
            ISO: Number,
            ExposureCompensation: Number,
            ShutterSpeedValue: Number,
            ApertureValue: Number,
            FocalLength: Number,
            FocalLengthIn35mmFormat: Number,
            LensModel: String,
        },
    },
    // exifData: Object,

    // cameraModel: String,
});

module.exports = mongoose.model("Post", postSchema);

// //base packages import
// const mongoose = require("mongoose");
// const { ObjectId } = mongoose.Schema;

// //vytvorenie noveho modelu pre post
// const postSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true,
//     },

//     body: {
//         type: String,
//         required: true,
//     },

//     image: {
//         data: Buffer, //binary data format
//         contentType: "String",
//         /*
//     Buffer:
//     Raw data is stored in instances of the Buffer class.
//     A Buffer is similar to an array of integers but corresponds
//     to a raw memory allocation outside the V8 heap.
//     'ascii'|'utf8'|'utf16le'|'ucs2'|'base64'|'binary'|'hex'
//     */
//     },

//     postedBy: {
//         type: ObjectId, //userid
//         ref: "User", //referencujeme inu schemu >> User model
//         /*
//     objectId:
//     typ objectId je napriklad aj bezne _id ktore je generovane pri kazdom objekte
//     v mongodb databaze, je to proste specialnyt typ integeru a vola sa objectId */
//     },

//     created: {
//         type: Date,
//         default: Date.now(),
//     },

//     updated: Date,

//     likes: [{ type: ObjectId, ref: "User" }],

// });

// module.exports = mongoose.model("Post", postSchema);
