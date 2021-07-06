//obsahuje logiku ktorou sa bude riesit samotny user, co moze robit....
const _ = require("lodash");

const User = require("../schemes/scheme_user");

exports.userByID = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err) return res.status(500).json({ error: "Internal server error" });

    if (!user) return res.status(401).json({ error: "User not found" });

    req.profile = user; // pridanie profile objektu s informaciami o userovi do request objektu
    next();
  });
};

exports.hasAuthorization = (req, res, next) => {
  const authorized =
    req.profile && req.auth && req.profile._id === req.auth._id;
  if (!authorized)
    return res
      .status(401)
      .json({ error: "You are not authorized to perform this action" });
};

exports.getAllUsers = (req, res, next) => {
  User.find((err, users) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    res.status(200).json({ users: users });
  }).select("username _id updated created");
};

exports.getUser = (req, res, next) => {
  req.profile.salt = undefined;
  req.profile.passwordHash = undefined;
  return res.status(200).json(req.profile);
};

exports.updateUser = (req, res, next) => {
  let user = req.profile;

  user = _.extend(user, req.body); //prepisuje povodny objekt usera infomaciami v req.body >> ak nam pride novy username tak ho prepise v user objekte
  user.updated = Date.now();
  user.save((err) => {
    if (err) {
      return res
        .status(401)
        .json({ error: "You are not authorized to perform this action" });
    }
    user.salt = undefined; //odstranenie saltu a hashu pretoze user sa bude preposielat na FE
    user.passwordHash = undefined;
    res.status(200).json({ user: user });
  });
};

exports.deleteUser = (req, res, next) => {
  let user = req.profile;

  user.remove((err, user) => {
    if (err) return res.status(401).json({ error: "Internal server error" });

    console.log(`API > DELETING USER ${user.username}: ${user}`);
    res.status(200).json({ message: `User ${user.username} has been deleted` });
  });
};
