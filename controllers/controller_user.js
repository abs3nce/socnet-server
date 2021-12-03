//obsahuje logiku ktorou sa bude riesit samotny user, co moze robit....
const _ = require("lodash");
const formidable = require("formidable");
const fs = require("fs");

const User = require("../schemes/scheme_user");
const Post = require("../schemes/scheme_post");

exports.userByID = (req, res, next, id) => {
    User.findById(id)
        //naplnenie followers a following arrayu Usera
        .populate("following", "_id username")
        .populate("followers", "_id username") //pridat podla potreby
        .exec((err, user) => {
            if (err)
                return res.status(500).json({ error: "Internal server error" });
            if (!user) return res.status(401).json({ error: "User not found" });
            req.profile = user; // pridanie informacii o userovi do req.profile
            next();
        });
};

exports.isOwnerOfAccount = (req, res, next) => {
    //pokial existuje v req objekte .profile, .auth a pokial sa .profile._id rovna .auth._id tak sameUser = true
    let sameUser = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!sameUser) {
        return res
            .status(401)
            .json({ error: "You are not authorized to perform this action" });
    }
    next();
};

exports.getAllUsers = (req, res, next) => {
    User.find((err, users) => {
        if (err)
            return res.status(500).json({ error: "Internal server error" });
        res.json(users);
    }).select("username email _id updated created following followers posts");
};

exports.getUser = (req, res, next) => {
    // z req.profile objectu ktory bol pridany v userById() sa vytiahne dany user
    // plus sa vymaze salt a passwordHash kvoli bezpecnosti
    req.profile.salt = undefined;
    req.profile.passwordHash = undefined;
    return res.status(200).json(req.profile);
};

exports.getUserProfilePicture = (req, res, next) => {
    if (req.profile.profilePicture.data) {
        res.set("Content-Type", req.profile.profilePicture.contentType);
        return res.send(req.profile.profilePicture.data);
    }
    next();
};

exports.updateUser = (req, res, next) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        //chceme spracovat form fields a aj pripadne uploadovane images
        if (err)
            return res
                .status(500)
                .json({ error: "Photo could not be uploaded" });
        let user = req.profile;
        user = _.extend(user, fields); //nahranie novych udajov do user objektu
        user.updated = Date.now();

        console.log(`user from FE: `, user);
        if (files.profilePicture) {
            user.profilePicture.data = fs.readFileSync(
                files.profilePicture.path
            );
            user.profilePicture.contentType = files.profilePicture.type;
        }

        user.save((err, result) => {
            if (err) return res.status(500).json({ error: err });

            user.salt = undefined; //odstranenie saltu a hashu pretoze user sa bude preposielat na FE
            user.passwordHash = undefined;
            res.status(200).json(user);
        });
    });
};

exports.deleteUser = async (req, res, next) => {
    let user = req.profile;

    console.log(`API > REMOVING INSTANCES OF ${user.username} IN COMMENTS`);
    await Post.updateMany(
        {
            "comments.postedBy": req.profile._id,
        },
        {
            $pull: {
                comments: {
                    postedBy: req.profile._id,
                },
            },
        }
    );
    console.log(
        `API > FINISHED REMOVING INSTANCES OF ${user.username} IN COMMENTS`
    );

    console.log(`API > REMOVING INSTANCES OF ${user.username} IN LIKES`);
    await Post.updateMany(
        { likes: req.profile._id },
        { $pull: { likes: req.profile._id } }
    );
    console.log(
        `API > FINISHED REMOVING INSTANCES OF ${user.username} IN LIKES`
    );

    console.log(`API > REMOVING INSTANCES OF ${user.username} IN FOLLOWERS`);
    await User.updateMany(
        { followers: req.profile._id },
        { $pull: { followers: req.profile._id } }
    );
    console.log(
        `API > FINISHED REMOVING INSTANCES OF ${user.username} IN FOLLOWERS`
    );

    console.log(`API > REMOVING INSTANCES OF ${user.username} IN FOLLOWING`);
    await User.updateMany(
        { following: req.profile._id },
        { $pull: { following: req.profile._id } }
    );
    console.log(
        `API > FINISHED REMOVING INSTANCES OF ${user.username} IN FOLLOWING`
    );

    console.log(`API > DELETING POSTS BY ${user.username}`);
    await Post.deleteMany({ postedBy: req.profile._id }, (err, post) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err });
        }
    });
    console.log(`API > FINISHED DELETING POSTS BY ${user.username}`);

    console.log(`API > DELETING ${user.username}`);
    await user.remove((err, user) => {
        if (err) {
            console.log(`API > ERROR WHILE DELETING ${user.username}: `, err);
            return res.status(401).json({ error: err });
        }
    });
    console.log(`API > FINISHED DELETING ${user.username}: ${user}`);
    res.status(200).json({
        message: `User ${user.username} has been deleted successfully`,
    });
};

exports.addFollowing = (req, res, next) => {
    User.findByIdAndUpdate(
        req.body.userID,
        //prida uzivatela do "following" arrayu >> uzivatel sa stava sledovatelom
        { $push: { following: req.body.followID } },
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            next();
        }
    );
};

exports.addFollower = (req, res) => {
    User.findByIdAndUpdate(
        req.body.followID,
        //prida uzivatela do followers listu >> uzivatel je sledovany
        { $push: { followers: req.body.userID } },
        { new: true } //mongodb nam bude navracat iba nove udaje
    )
        .populate("following", "_id username")
        .populate("followers", "_id username")
        .exec((err, result) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            result.passwordHash = undefined;
            result.salt = undefined;
            res.json(result);
        });
};

exports.removeFollowing = (req, res, next) => {
    User.findByIdAndUpdate(
        req.body.userID,
        //prida uzivatela do "following" arrayu >> uzivatel sa stava sledovatelom
        { $pull: { following: req.body.unfollowID } },
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            next();
        }
    );
};

exports.removeFollower = (req, res) => {
    User.findByIdAndUpdate(
        req.body.unfollowID,
        //prida uzivatela do followers listu >> uzivatel je sledovany
        { $pull: { followers: req.body.userID } },
        { new: true } //mongodb nam bude navracat iba nove udaje
    )
        .populate("following", "_id username")
        .populate("followers", "_id username")
        .exec((err, result) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            result.passwordHash = undefined;
            result.salt = undefined;
            res.json(result);
        });
};

exports.suggestedUsers = (req, res) => {
    //vyhladanie uzivatelov, ktori nie su v rozsahu uz sledovanych
    let userFollows = req.profile.following;
    let exceptUsers = req.profile.following;
    exceptUsers.push(req.profile._id);
    // console.log(`${req.profile.username} follows: `, userFollows);

    //nin (not included)
    User.find(
        { followers: { $in: userFollows }, _id: { $nin: exceptUsers } },
        (err, users) => {
            if (err) {
                return res.status(500).json({
                    error: err,
                });
            }

            let uniqueUsers = _.uniq(users);
            console.log(uniqueUsers);
            res.json(uniqueUsers);
        }
    ).select("username following followers");
};

// exports.suggestedUsers = (req, res) => {
//     //vyhladanie uzivatelov, ktori nie su v rozsahu uz sledovanych
//     let following = req.profile.following;
//     following.push(req.profile._id);
//     //nin (not included)
//     User.find({ _id: { $nin: following } }, (err, users) => {
//         if (err) {
//             return res.status(500).json({
//                 error: err,
//             });
//         }
//         res.json(users);
//     }).select("username following followers");
// };
