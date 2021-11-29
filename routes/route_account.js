//base packages import
const express = require("express");
const router = express.Router();

//controllers
const accountController = require("../controllers/controller_account");
const userController = require("../controllers/controller_user");

//validator
const accountValidator = require("../validator/index");

//routes a ich validacie

//ak je accessnute /register, request prejde cez validator, aby sa zistilo ci data davaju zmysel podla nastavenych kriterii
//a iba ak vsetko vyhovuje a nenastanie ziaden error az potom su presmerovane do funkcie registerUser v accountControlleri
router.post(
    "/register",
    accountValidator.userRegisterValidator,
    accountController.registerUser
);

//tu sa nemusi nic kontrolat kedze je to login
router.post("/login", accountController.loginUser);

//social login cez google napr
// router.post("/social-login", accountController.socialLogin);

//tu realne robime iba get req na to aby sme sa odhlasili vymazanim cookiesky
router.get("/logout", accountController.logoutUser);

//routes na ovladanie zabudnutia hesla
router.put("/forgot-password", accountController.forgotPassword);
router.put(
    "/reset-password",
    accountValidator.passwordResetValidator,
    accountController.resetPassword
);

//pokial je v URL niekde "userID" tak presmeruje na middleware a funkciu userByID
router.param("userID", userController.userByID);

module.exports = router;
