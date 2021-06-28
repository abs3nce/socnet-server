//packages
const express = require("express");

//controller
//pri accessnuti "/" presmeruje na controller getPost v controller_getPost
const postController = require("../controllers/controller_post");

const router = express.Router();

router.get("/post/get", postController.getPost);

router.post("/post/create", postController.createPost);

module.exports = router;
