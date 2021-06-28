//express a router expressu
const express = require("express");
const router = express.Router();

//controller
//pri accessnuti "/" presmeruje na controller getPost v controller_getPost
const authController = require("../controllers/controller_auth");

//validator
const authValidator = require("../validator/index");

//routes a ich metody
router.post(
  "/users/register",
  authValidator.userRegisterValidator,
  authController.signupUser
);

module.exports = router;
