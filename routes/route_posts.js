//base packages import
const express = require("express");
const router = express.Router();

//controllers
const postController = require("../controllers/controller_posts");
const accountController = require("../controllers/controller_account");
const userController = require("../controllers/controller_user");

// R O U T E S
//like unlike
router.put(
    "/posts/like",
    accountController.requireLogin,
    postController.likePost
);

router.put(
    "/posts/unlike",
    accountController.requireLogin,
    postController.unLikePost
);

router.put(
    "/posts/comment",
    accountController.requireLogin,
    postController.commentPost
);

router.put(
    "/posts/uncomment",
    accountController.requireLogin,
    postController.uncommentPost
);

//get vsetkych postov v DB
router.get("/posts", postController.getPosts);

//get vsetkych postov uzivatela
router.get("/posts/by/:userid", postController.getPostsByUser);

//get vsetkych postov v DB
router.get(
    "/posts/followed/:userid",
    accountController.requireLogin,
    postController.getFollowedFeed
);

//get jedneho postu s idckom
router.get("/posts/:postid", postController.getPost);

//get thumbnailu obrazku jedneho postu s idckom
router.get("/posts/pfp/thumb/:postid", postController.getPostThumbnail);

//get obrazku jedneho postu s idckom
router.get("/posts/pfp/:postid", postController.getPostPicture);

//vytvorenie postu
router.post(
    "/posts/:userid",
    [accountController.requireLogin],
    postController.createPost
);

//post vieme upravit tym ze jeho id targetneme a posleme put request s title a body
//samozrejme treba byt ownerom a prihlaseny
router.put(
    "/posts/:postid",
    [accountController.requireLogin, postController.isOwnerOfPost],
    postController.updatePost
);

//post vieme vymazat targetnutim jeho id, samozrejme treba byt ownerom a byt prihlaseny
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
