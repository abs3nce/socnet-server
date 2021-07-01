const User = require("../models/model_user");

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
