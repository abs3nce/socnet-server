//base
const express = require("express");
const router = express.Router();

//controllers
const userController = require("../controllers/controller_user");
const accountController = require("../controllers/controller_account");

//routes a ich validacie
router.get("/users", userController.getAllUsers);
router.get(
  "/users/:userid",
  /*accountController.requireLogin,*/
  userController.getUser
);

//pokial je v URL niekde "userID" tak presmeruje na middleware a funkciu userByID
router.param("userid", userController.userByID);

module.exports = router;
