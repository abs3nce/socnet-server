//obsahuje logiku pre posty, getovanie, vytvorenie....

const _ = require("lodash");
const formidable = require("formidable");
const fs = require("fs");
const ExifImage = require("exif").ExifImage;
const jimp = require("jimp");

//models
const Post = require("../schemes/scheme_post");

//middleware, podla postID sa prida dany post do req objektu ako .post
exports.postByID = (req, res, next, id) => {
    Post.findById(id)
        .populate("postedBy", "_id username role")
        .populate("comments", "text created")
        .populate("comments.postedBy", "_id username")
        .exec((err, post) => {
            if (err || !post) return res.status(401).json({ error: err });
            req.post = post;
            console.log(`API (POSTS) > FINDING POST WITH ID ${id}`);
            next();
        });
};

exports.postActionAuth = (req, res, next) => {
    let postOwnerUser =
        req.post && req.auth && req.post.postedBy._id == req.auth._id;
    let adminUser = req.post && req.auth && req.auth.role === "administrator";

    console.log("API > req.post:", req.post);
    console.log("API > req.auth:", req.auth);
    console.log(
        `API > ${req.post.postedBy.username}: postOwnerUser: ${postOwnerUser}, adminUser: ${adminUser}`
    );

    let isAuthorized = postOwnerUser || adminUser;
    if (!isAuthorized) {
        return res
            .status(401)
            .json({ error: "Nie ste oprávnený vykonať túto akciu" });
    }
    next();
};

exports.getPost = (req, res) => {
    console.log(`API (POSTS) > GETTING POST WITH ID ${req.post._id}`);

    return res.json(req.post);
};

exports.getPosts = async (req, res) => {
    const currentPage = req.query.pageNumber || 1;
    const postsPerPage = 3;

    const posts = await Post.find()
        .countDocuments()
        .then(() => {
            return Post.find()
                .skip((currentPage - 1) * postsPerPage)
                .populate("postedBy", "_id username created")
                .populate("comments", "text created")
                .populate("comments.postedBy", "_id username")
                .select("-image -thumbnailImage")
                .sort({ _id: -1 })
                .limit(postsPerPage);
        })
        .then((posts) => {
            res.status(200).json(posts);
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getAllPosts = async (req, res) => {
    await Post.find()
        .populate("postedBy", "_id username created")
        .populate("comments", "text created")
        .populate("comments.postedBy", "_id username")
        .select("-image -thumbnailImage")
        .sort({ _id: -1 })
        .exec((err, posts) => {
            if (err) {
                return res.status(500).json({ error: err });
            } else {
                return res.status(200).json(posts);
            }
        });
};

exports.getFollowedFeed = async (req, res, next) => {
    let userFollows = req.profile.following;
    userFollows.push(req.profile._id);

    const currentPage = req.query.pageNumber || 1;
    const postsPerPage = 3;

    console.log(`Users followed by ${req.profile.username}: `, userFollows);

    const posts = await Post.find(
        { postedBy: { $in: userFollows } },
        (err, posts) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err });
            }
            console.log(posts);
            res.status(200).json(posts);
        }
    )
        .skip((currentPage - 1) * postsPerPage)
        .select("-image -thumbnailImage")
        .populate("postedBy", "_id username created")
        .populate("comments", "text created")
        .populate("comments.postedBy", "_id username")
        .sort({ _id: -1 })
        .limit(postsPerPage);
};

exports.getPostsByUser = (req, res, next) => {
    Post.find({ postedBy: req.profile._id })
        //populate pouzivame pretoze v Post scheme mame definovane ze hladame referenciu na User schemu, ak by to bolo opacne pouzili by sme .select
        .select("-image -thumbnailImage")
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

exports.getPostThumbnail = (req, res, next) => {
    res.set("Content-Type", req.post.thumbnailImage.contentType);
    return res.send(req.post.thumbnailImage.data);
};

exports.createPost = (req, res, next) => {
    let form = new formidable.IncomingForm(); //vytvor novy form
    form.keepExtensions = true; //uchovaj extensions
    //parsni form s udajmi z req a ak nasledne handleni callbacks
    form.parse(req, async (err, fields, files) => {
        //handler pre error pri nahravani image
        if (err)
            return res.status(500).json({ error: "Problém s nahrávaním dát" });

        let post = new Post(fields); //vytvorenie postu podla schemy Post s udajmi z fieldov z FE

        post.postedBy = req.profile; //vymazanie passwordHashu a saltu z udajov o poste
        post.postedBy.passwordHash = undefined;
        post.postedBy.salt = undefined;

        // -----------------------------------------------------------------------------
        // provizorna validacia udajov z inputu formu
        const { title, body, categories, tags } = fields;

        if (!title || !title.length) {
            return res
                .status(401)
                .json({ error: "Názov fotografie nesmie ostať prázdny" });
        }

        if (title.length < 8 || title.length > 150) {
            return res.status(401).json({
                error: "Názov musí mať aspoň 8 znakov a maximálne 150 znakov",
            });
        }

        // if (!body || !body.length) {
        //     return res.status(401).json({ error: "Body must not be empty" });
        // }

        if (!body || !body.length) {
            body = " ";
        }

        if (body.length > 1500) {
            return res.status(401).json({
                error: "Maximálna dĺžka tela fotografie je 1500 znakov",
            });
        }

        if (files.image) {
            //validacia velkosti image
            if (files.image.size > 10000000) {
                return res
                    .status(401)
                    .json({ error: "Maximálna veľkosť fotografie je 10 MB" });
            }
            // -----------------------------------------------------------------------------

            //handling suborov z FE pomocou fska
            post.image.data = fs.readFileSync(files.image.path);
            post.image.contentType = files.image.type;

            post.exifData = await new Promise((res, rej) => {
                try {
                    new ExifImage({ image: post.image.data }, function (
                        error,
                        exifData
                    ) {
                        if (error) {
                            console.log("Error: ", error.message);
                            res();
                        } else {
                            res(exifData);
                        }
                    });
                } catch (error) {
                    console.log("Error: ", error.message);
                    rej();
                }
            });

            const thumb = await jimp.read(post.image.data);
            post.thumbnailImage.data = await thumb
                .cover(
                    512,
                    512,
                    jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE
                )
                .getBufferAsync(jimp.AUTO);
            post.thumbnailImage.contentType = files.image.type;
        }

        post.save((err, result) => {
            //ulozenie postu do DB
            if (err)
                return res.status(500).json({ error: "Internal server error" });
            res.status(200).json({ result: result });
            console.log(`API > POST DATA: `, result);
        });
    });
};

exports.updatePost = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
        //chceme spracovat form fields a aj pripadne uploadovane images
        if (err)
            return res.status(500).json({ error: "Problém s nahrávaním dát" });

        let post = req.post;
        post = _.extend(post, fields); //nahranie novych udajov do post objektu
        post.updated = Date.now();

        console.log(`post from FE: `, post);
        if (files.image) {
            post.image.data = fs.readFileSync(files.image.path);
            post.image.contentType = files.image.type;

            post.exifData = await new Promise((res, rej) => {
                try {
                    new ExifImage({ image: post.image.data }, function (
                        error,
                        exifData
                    ) {
                        if (error) {
                            console.log("Error: ", error.message);
                            res();
                        } else {
                            res(exifData);
                        }
                    });
                } catch (error) {
                    console.log("Error: ", error.message);
                    rej();
                }
            });

            const thumb = await jimp.read(post.image.data);
            post.thumbnailImage.data = await thumb
                .cover(
                    256,
                    256,
                    jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE
                )
                .getBufferAsync(jimp.AUTO);
            post.thumbnailImage.contentType = files.image.type;
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

exports.likePost = (req, res) => {
    Post.findByIdAndUpdate(
        req.body.postID,
        {
            $push: { likes: req.body.userID },
        },
        { new: true }
    ).exec((err, result) => {
        if (err) {
            return res.status(500).json({ error: err });
        } else {
            res.json(result);
        }
    });
};

exports.unLikePost = (req, res) => {
    Post.findByIdAndUpdate(
        req.body.postID,
        {
            $pull: { likes: req.body.userID },
        },
        { new: true }
    ).exec((err, result) => {
        if (err) {
            return res.status(500).json({ error: err });
        } else {
            res.json(result);
        }
    });
};

exports.commentPost = (req, res) => {
    let comment = req.body.comment;
    comment.postedBy = req.body.userID;

    Post.findByIdAndUpdate(
        req.body.postID,
        {
            $push: { comments: comment },
        },
        { new: true }
    )
        .populate("comments.postedBy", "_id username")
        .populate("postedBy", "_id username")
        .exec((err, result) => {
            if (err) {
                return res.status(500).json({ error: err });
            } else {
                res.json(result);
            }
        });
};
exports.uncommentPost = (req, res) => {
    let comment = req.body.comment;

    Post.findByIdAndUpdate(
        req.body.postID,
        {
            $pull: { comments: { _id: comment._id } },
        },
        { new: true }
    )
        .populate("comments.postedBy", "_id username")
        .populate("postedBy", "_id username")
        .exec((err, result) => {
            if (err) {
                return res.status(500).json({ error: err });
            } else {
                res.json(result);
            }
        });
};
