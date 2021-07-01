//express a router expressu
const express = require("express");
const router = express.Router();

//controller
//pri accessnuti "/" presmeruje na controller getPost v controller_getPost
const postController = require("../controllers/controller_posts");
const { requireLogin } = require("../controllers/controller_auth");
const { userByID } = require("../controllers/controller_user");

//validator
const postValidator = require("../validator/index");

//routes a ich metody
router.get("/posts/get", postController.getPosts);

//post (ktory vytvarame) musi prejst validaciou v metode "createPostValidator", az potom je presmerovany do controlleru
//preto nepotrebujeme v controlleri checkovat error a pouzivame iba result, checkujeme ho uz vo validatore
router.post(
  "/posts/create",
  [requireLogin, postValidator.createPostValidator],
  postController.createPost
);

//pokial je v URL niekde "userID" tak presmeruje na middleware a funkciu userByID
router.param("userID", userByID);

module.exports = router;





//premenuj si tie files, je to confusing