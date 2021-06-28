//packages
const express = require("express");

//controller
//pri accessnuti "/" presmeruje na controller getPost v controller_getPost
const postController = require("../controllers/controller_post");

//validator
const postValidator = require("../validator/index");

const router = express.Router();

router.get("/post/get", postController.getPost);

//post (ktory vytvarame) musi prejst validaciou v metode "createPostValidator", az potom je presmerovany do controlleru
//preto nepotrebujeme v controlleri checkovat error a pouzivame iba result, checkujeme ho uz vo validatore
router.post("/post/create", postValidator.createPostValidator, postController.createPost); 

module.exports = router;
