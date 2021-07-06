//obsahuje logiku pre posty, get, vytvorenie....

//models
const Post = require("../schemes/scheme_post");

exports.getPosts = (req, res, next) => {
  const posts = Post.find()
    .then((posts) => {
      res.status(200).json({ posts: posts });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.createPost = (req, res, next) => {
  const post = new Post(req.body);
  console.log(`API > CREATING POST: ${post}`);

  post.save().then((result) => {
    res.status(200).json({ post: result });
  });
};
