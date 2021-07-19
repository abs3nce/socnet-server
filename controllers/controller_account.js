//obsahuje logiku ktorou sa bude riesit prihlasovanie uzivatela, registracia, odhlasovanie a veci okolo jeho uctu

const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");
require("dotenv").config();
const User = require("../schemes/scheme_user");

exports.registerUser = async (req, res, next) => {
  const userExists = await User.findOne({ username: req.body.username }); //najdi usera s username z FE
  if (userExists)
    //pokial tento user uz existuje tak zamietni registraciu
    return res.status(401).json({ error: "Username already exists" });

  const user = await new User(req.body); //pokial tento user neexistoval >> vytvor novy instance Usera s udajmi z FE
  await user.save(); //uloz ho do DB a na FE posli response s udajmi
  console.log(`API > SAVING USER TO DB: ${user}`);
  res.status(200).json({
    user: { username: user.username, _id: user._id, created: user.created },
    message: "Registration successful",
  });
};

exports.loginUser = (req, res, next) => {
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
    //pokial bol user najdeny ale heslo bolo zle zadane (v authUser() v User modeli funkcii bolo returnute true) >> generovanie tokenu
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    //vytvorime cookie so zivotnostou jednej hodiny ktory v sebe drzi token uzivatela, bez neho nie je autorizovatelny
    res.cookie("token", token, { expire: new Date() + 3600 });

    //return usera s tokenom na FE
    console.log(`API > USER ${user.username} LOGGED IN:`, user, { token });
    return res
      .status(200)
      .json({ token, user: { username: user.username, _id: user._id } });
  });
};

exports.logoutUser = (req, res, next) => {
  //proste vymazeme cookie s menom token a tym padom odhlasime uzivatela
  res.clearCookie("token");
  res.status(200).json({ message: "User signed out" });
};

exports.requireLogin = expressJWT({
  // funkcia zistuje ci sa v tokene nachadza spravny secret key z .env filu
  userProperty: "auth",
  secret: process.env.JWT_SECRET, // ak ano tak uzivatela pusti dalej, ak nie tak ho zamietne
  algorithms: ["HS256"], // definovane kvoli novej verzii express-jwt
  //pokial je token validny >> expressJWT prida idcko overeneho usera do request objectu vo forme auth klucu
});
