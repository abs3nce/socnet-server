//models
const Post = require("../models/model_post");

exports.getPosts = (req, res) => {
  const posts = Post.find()
    .then((posts) => {
      res.status(200).json({ posts: posts });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.createPost = (req, res) => {
  const post = new Post(req.body);
  console.log(`API > CREATING POST: ${post}`);

  post.save().then((result) => {
    res.status(200).json({ post: result });
  });
};
