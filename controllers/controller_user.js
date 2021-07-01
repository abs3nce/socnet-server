//obsahuje logiku ktorou sa bude riesit samotny user, co moze robit....

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
      .json({ error: "User is not authorized to perform this action" });
};

exports.getAllUsers = (req, res) => {
  User.find((err, users) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    res.status(200).json({ users: users });
  }).select("username _id updated created");
};

exports.getUser = (req, res) => {
  req.profile.salt = undefined;
  req.profile.passwordHash = undefined;
  return res.status(200).json(req.profile);
};
