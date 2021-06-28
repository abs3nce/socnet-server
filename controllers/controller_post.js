//packages
//models
const Post = require("../models/model_post");

exports.getPost = (req, res) => {
  res.json({
    posts: [
      { title: "SocNet in development!" },
      { title: "Developers of SocNet are in crisis!" },
    ],
  });
};

exports.createPost = (req, res) => {
  const post = new Post(req.body);
  console.log(`API > CREATING POST: ${post}`);

  post.save((err, result) => {
    if (err) return res.status(400).json({ error: err });
    res.status(200).json({ post: result });
  });
};
