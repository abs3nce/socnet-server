//base packages import
const express = require("express");
const router = express.Router();

//controllers
const userController = require("../controllers/controller_user");
const accountController = require("../controllers/controller_account");

// R O U T E S
router.put(
    "/users/follow",
    [accountController.requireLogin, userController.addFollowing],
    userController.addFollower
);

router.put(
    "/users/unfollow",
    [accountController.requireLogin, userController.removeFollowing],
    userController.removeFollower
);

//navratenie vsetkych registrovanych uzivatelov
router.get("/users", userController.getAllUsers);

//navratenie urciteho usera so zadanym userid
router.get("/users/:userid", userController.getUser);

//navratenie profilePicture uzivatela
router.get("/users/pfp/:userid", userController.getUserProfilePicture);

//navratenie uzivatelov ktorych moze user followovat (navrhovani uzivatelia)
router.get("/users/suggested/:userid", userController.suggestedUsers);

//upravenie profilu a udajov usera pomocou targetnutia jeho id
//samozrejme moze iba prihlaseny owner
router.put(
    "/users/:userid",
    [accountController.requireLogin, userController.accountActionAuth],
    userController.updateUser
);

//vymazanie profilu usera pomocou targetnutia jeho id
//samozrejme moze iba prihlaseny owner
router.delete(
    "/users/:userid",
    [accountController.requireLogin, userController.accountActionAuth],
    userController.deleteUser
);

//pokial je v URL niekde "userID" tak presmeruje na middleware a funkciu userByID
router.param("userid", userController.userByID);

module.exports = router;
