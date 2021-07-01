//express a router expressu
const express = require("express");
const router = express.Router();

//controller
//pri accessnuti "/" presmeruje na controller getPost v controller_getPost
const authController = require("../controllers/controller_auth");
const userController = require("../controllers/controller_user");

//validator
//pri accessnuti presmeruje na inu cast scriptu ktora este pooveruje definovane hodnoty ako su napr dlzky....
const authValidator = require("../validator/index");

//routes a ich validacie
router.post(
  "/register",
  authValidator.userRegisterValidator,
  authController.registerUser
);

router.post("/login", authController.loginUser);

router.get("/logout", authController.logoutUser);

//pokial je v URL niekde "userID" tak presmeruje na middleware a funkciu userByID
router.param("userID", userController.userByID);

module.exports = router;
