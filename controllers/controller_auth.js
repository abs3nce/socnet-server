const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/model_user");

exports.registerUser = async (req, res) => {
  const userExists = await User.findOne({ username: req.body.username });
  if (userExists)
    return res.status(401).json({ error: "Username already exists" });

  const user = await new User(req.body);
  await user.save();
  console.log(`API > SAVING USER TO DB: ${user}`);
  res.status(200).json({
    user: { username: user.username, _id: user._id, created: user.created },
    message: "Registration successful",
  });
};

exports.loginUser = (req, res) => {
  //najdenie usera na zaklade username
  const { _id, username, password } = req.body;

  User.findOne({ username: req.body.username }, (err, user) => {
    //pokial nastali nejake errory
    if (err) return res.status(500).json({ error: "Internal server error" });

    //pokial user nebol najdeny
    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid credentials, please try again" });
    }
    //pokial bol user najdeny ale heslo bolo zle zadane (v authUser() v user modeli funkcii bolo returnute false) >> zamietnutie
    if (!user.authUser(password)) {
      return res
        .status(401)
        .json({ error: "Invalid credentials, please try again" });
    }
    //pokial bol user najdeny ale heslo bolo zle zadane (v authUser() v user modeli funkcii bolo returnute true) >> generovanie tokenu
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    //token sa spoji s cookie s menom token a nastavi sa mu expire 1 hodiny
    res.cookie("token", token, { expire: new Date() + 3600 });

    //return usera s tokenom na FE
    console.log(`API > USER ${user.username} LOGGED IN:`, user, {token});
    return res
      .status(200)
      .json({ token, user: { username: user.username, _id: user._id } });
  });
};
