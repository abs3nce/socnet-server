//packages
const express = require("express");

//controller
//pri accessnuti "/" presmeruje na controller getPost v controller_getPost
const getPostController = require("../controllers/controller_getPost");

const router = express.Router();

router.get("/", getPostController.getPost);

module.exports = router;
