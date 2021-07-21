//base
const express = require("express");
const router = express.Router();

//controllers
const postController = require("../controllers/controller_posts");
const accountController = require("../controllers/controller_account");
const userController = require("../controllers/controller_user");

//validator udajov (obsah, velkost obsahu)
const postValidator = require("../validator/index");

//routes
//stiahnutie vsetkych postov v DB
router.get("/posts", postController.getPosts);

// router.get("/posts/author/:userid", postController.getPostsByUser);
router.get("/posts/:userid", postController.getPostsByUser);

//post (ktory vytvarame) musi prejst validaciou v metode "createPostValidator" vo validatore a samozrejme requireLogin v controller_account, az potom je presmerovany do controlleru
//preto nepotrebujeme v controlleri checkovat error a pouzivame iba result, checkujeme ho uz vo validatore
router.post(
  "/posts/:userid",
  [accountController.requireLogin, postController.createPost],
  postValidator.createPostValidator
);

router.put(
  "/posts/:postid",
  [accountController.requireLogin, postController.isOwnerOfPost],
  postController.updatePost
);

router.delete(
  "/posts/:postid",
  [accountController.requireLogin, postController.isOwnerOfPost],
  postController.deletePost
);

//pokial je v URL niekde "userID" tak presmeruje na middleware a funkciu userByID
router.param("userid", userController.userByID);

//pokial je v URL niekde "postID" tak presmeruje na middleware a funkciu postByID
router.param("postid", postController.postByID);

module.exports = router;
