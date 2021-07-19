//obsahuje logiku pre posty, get, vytvorenie....
const formidable = require("formidable");
const fs = require("fs");

//models
const Post = require("../schemes/scheme_post");

//middleware, podla postID sa prida dany post do req objektu ako .post
exports.postByID = (req, res, next, id) => {
  Post.findById(id)
    .populate("postedBy", "_id username")
    .exec((err, post) => {
      if (err || !post) return res.status(401).json({ error: err });
      req.post = post;
      next();
    });
};

exports.isOwnerOfPost = (req, res, next) => {
  let isOwner = req.post && req.auth && req.post.postedBy._id == req.auth._id;

  if (!isOwner) {
    return res
      .status(401)
      .json({ error: "You are not authorized to perform this action" });
  }
  next();
};

exports.getPosts = (req, res, next) => {
  const posts = Post.find()
    .populate("postedBy", "_id username created")
    .then((posts) => {
      res.status(200).json({ posts: posts });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getPostsByUser = (req, res, next) => {
  Post.find({ postedBy: req.profile._id })
    //populate pouzivame pretoze v Post scheme mame definovane ze hladame referenciu na User schemu, ak by to bolo opacne pouzili by sme .select
    .populate("postedBy", "_id username")
    .sort("_created")
    .exec((err, posts) => {
      if (err) return res.status(401).json({ error: err });
      res.status(200).json({ posts: posts });
    });
};

exports.createPost = (req, res, next) => {
  let form = new formidable.IncomingForm(); //vytvor novy form
  form.keepExtensions = true; //uchovaj extensions

  //parsni form s udajmi z req a ak nasledne handleni callbacks
  form.parse(req, (err, fields, files) => {
    //handler pre error pri nahravani image
    if (err)
      return res.status(401).json({ error: "Image could not be uploaded" });

    let post = new Post(fields); //vytvorenie postu schemy Post s udajmi z fieldov z FE

    post.postedBy = req.profile; //nastavenie ownera postu bez saltu a hashu
    post.postedBy.passwordHash = undefined;
    post.postedBy.salt = undefined;

    if (files.image) {
      //handling suborov z FE pomocou fska
      post.image.data = fs.readFileSync(files.image.path);
      post.image.contentType = files.image.type;
    }

    post.save((err, result) => {
      //ulozenie postu do DB
      if (err) return res.status(500).json({ error: "Internal server error" });
      res.status(200).json({ result: result });
    });

    console.log(`API > CREATING POST: ${post}`);
  });
};

exports.deletePost = (req, res, next) => {
  let post = req.post;
  post.remove((err, post) => {
    if (err) return res.status(401).json({ error: err });
    res.status(200).json({ message: "Post has been deleted successfully" });
  });
};
