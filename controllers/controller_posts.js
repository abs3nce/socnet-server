//obsahuje logiku pre posty, getovanie, vytvorenie....

const _ = require("lodash");
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

exports.getPost = (req, res) => {
    return res.json(req.post);
};

exports.getPosts = (req, res, next) => {
    const posts = Post.find()
        .populate("postedBy", "_id username created")
        .sort({ _id: -1 })
        .then((posts) => {
            res.status(200).json(posts);
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getPostsByUser = (req, res, next) => {
    Post.find({ postedBy: req.profile._id })
        //populate pouzivame pretoze v Post scheme mame definovane ze hladame referenciu na User schemu, ak by to bolo opacne pouzili by sme .select
        .populate("postedBy", "_id username")
        .sort({ _id: -1 })
        .exec((err, posts) => {
            if (err) return res.status(500).json({ error: err });
            res.status(200).json(posts);
        });
};

exports.getPostPicture = (req, res, next) => {
    res.set("Content-Type", req.post.image.contentType);
    return res.send(req.post.image.data);
};

exports.createPost = (req, res, next) => {
    let form = new formidable.IncomingForm(); //vytvor novy form
    form.keepExtensions = true; //uchovaj extensions
    //parsni form s udajmi z req a ak nasledne handleni callbacks
    form.parse(req, (err, fields, files) => {
        //handler pre error pri nahravani image
        if (err)
            return res
                .status(500)
                .json({ error: "Image could not be uploaded" });

        let post = new Post(fields); //vytvorenie postu podla schemy Post s udajmi z fieldov z FE

        post.postedBy = req.profile; //vymazanie passwordHashu a saltu z udajov o poste
        post.postedBy.passwordHash = undefined;
        post.postedBy.salt = undefined;

        // -----------------------------------------------------------------------------
        // provizorna validacia udajov z inputu formu
        const { title, body, categories, tags } = fields;

        if (!title || !title.length) {
            return res.status(401).json({ error: "Title must not be empty" });
        }

        if (title.length < 8 || title.length > 150) {
            return res.status(401).json({
                error: "The title's length must be between 8 to 150 characters",
            });
        }

        if (!body || !body.length) {
            return res.status(401).json({ error: "Body must not be empty" });
        }

        if (body.length < 8 || body.length > 1500) {
            return res.status(401).json({
                error: "The body's length must be between 8 to 1500 characters",
            });
        }

        if (files.image) {
            //validacia velkosti image
            if (files.image.size > 10000000) {
                return res
                    .status(401)
                    .json({ error: "Maximal size of an image is 10 MB" });
            }
            // -----------------------------------------------------------------------------

            //handling suborov z FE pomocou fska
            post.image.data = fs.readFileSync(files.image.path);
            post.image.contentType = files.image.type;
        }

        post.save((err, result) => {
            //ulozenie postu do DB
            if (err)
                return res.status(500).json({ error: "Internal server error" });
            res.status(200).json({ result: result });
        });

        console.log(`API > CREATING POST: ${post}`);
    });
};

exports.updatePost = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        //chceme spracovat form fields a aj pripadne uploadovane images
        if (err)
            return res
                .status(500)
                .json({ error: "Photo could not be uploaded" });

        let post = req.post;
        post = _.extend(post, fields); //nahranie novych udajov do post objektu
        post.updated = Date.now();

        console.log(`post from FE: `,post);
        if (files.image) {
            post.image.data = fs.readFileSync(
                files.image.path
            );
            post.image.contentType = files.image.type;
        }

        post.save((err, result) => {
            if (err) return res.status(500).json({ error: err });

            res.status(200).json(post);
        });
    });
};

exports.deletePost = (req, res, next) => {
    let post = req.post;
    post.remove((err, post) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json({ message: "Post has been deleted successfully" });
    });
};
