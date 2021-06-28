const User = require("../models/model_user");

exports.signupUser = async (req, res) => {
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
