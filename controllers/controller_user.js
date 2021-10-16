//obsahuje logiku ktorou sa bude riesit samotny user, co moze robit....
const _ = require("lodash");
const formidable = require("formidable");
const fs = require("fs");

const User = require("../schemes/scheme_user");

exports.userByID = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!user) return res.status(401).json({ error: "User not found" });
    req.profile = user; // pridanie informacii o userovi do req.profile
    next();
  });
};

exports.isOwnerOfAccount = (req, res, next) => {
  //pokial existuje v req objekte .profile, .auth a pokial sa .profile._id rovna .auth._id tak sameUser = true
  let sameUser = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!sameUser) {
    return res
      .status(401)
      .json({ error: "You are not authorized to perform this action" });
  }
  next();
};

exports.getAllUsers = (req, res, next) => {
  User.find((err, users) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    res.json(users);
  }).select("username email _id updated created");
};

exports.getUser = (req, res, next) => {
  // z req.profile objectu ktory bol pridany v userById() sa vytiahne dany user
  // plus sa vymaze salt a passwordHash kvoli bezpecnosti
  req.profile.salt = undefined;
  req.profile.passwordHash = undefined;
  return res.status(200).json(req.profile);
};

// exports.updateUser = (req, res, next) => {
//   let user = req.profile;

//   user = _.extend(user, req.body); //prepisuje povodny objekt usera infomaciami v req.body >> ak nam pride novy username tak ho prepise v user objekte
//   user.updated = Date.now();
//   user.save((err) => {
//     if (err) {
//       return res
//         .status(401)
//         .json({ error: "You are not authorized to perform this action" });
//     }
//     user.salt = undefined; //odstranenie saltu a hashu pretoze user sa bude preposielat na FE
//     user.passwordHash = undefined;
//     res.status(200).json({ user: user });
//   });
// };

exports.updateUser = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    //chceme spracovat form fields a aj pripadne uploadovane images
    if (err)
      return res.status(500).json({ error: "Photo could not be uploaded" });
    let user = req.profile;
    user = _.extend(user, fields); //nahranie novych udajov do user objektu
    user.updated = Date.now();

    if (files.profilePicture) {
      user.profilePicture.data = fs.readFileSync(files.profilePicture.path);
      user.profilePicture.contentType = files.profilePicture.type;
    }

    user.save((err, result) => {
      if (err) return res.status(500).json({ error: err });

      user.salt = undefined; //odstranenie saltu a hashu pretoze user sa bude preposielat na FE
      user.passwordHash = undefined;
      res.status(200).json(user);
    });
  });
};

exports.deleteUser = (req, res, next) => {
  let user = req.profile;

  user.remove((err, user) => {
    if (err) return res.status(401).json({ error: "Internal server error" });

    console.log(`API > DELETING USER ${user.username}: ${user}`);
    res
      .status(200)
      .json({ message: `User ${user.username} has been deleted successfully` });
  });
};
