//obsahuje logiku ktorou sa bude riesit prihlasovanie uzivatela, registracia, odhlasovanie a veci okolo jeho uctu
const User = require("../schemes/scheme_user");
const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");
require("dotenv").config();
const dotenv = require("dotenv");
dotenv.config();
const _ = require("lodash");
const { sendEmail } = require("../helpers/mailer");
// load env

exports.registerUser = async (req, res, next) => {
    //checkni pre duplikovany ucet
    //pokial tento user uz existuje tak zamietni registraciu
    usernameExists = await User.findOne({ username: req.body.username });
    if (usernameExists)
        return res.status(401).json({ error: "Username already in use" });

    emailExists = await User.findOne({ email: req.body.email });
    if (emailExists)
        return res.status(401).json({ error: "Email already in use" });

    const user = await new User(req.body); //pokial tento user neexistoval >> vytvor novy instance Usera s udajmi z FE
    await user.save(); //uloz ho do DB a na FE posli response s udajmi

    console.log(`API (REGISTER) > SAVING USER TO DB: ${user}`);
    res.status(200).json({
        user: {
            username: user.username,
            email: user.email,
            _id: user._id,
            created: user.created,
        },
        message: "Registration successful",
    });
};

exports.loginUser = (req, res, next) => {
    //najdenie usera na zaklade username
    const { _id, username, password } = req.body;

    User.findOne({ username: username }, (err, user) => {
        //pokial nastali nejake errory
        if (err)
            return res.status(500).json({ error: "Internal server error" });

        //pokial user nebol najdeny
        if (!user) {
            return res
                .status(401)
                .json({ error: "Invalid credentials, please try again" });
        }
        //pokial bol user najdeny ale heslo bolo zle zadane (v authUser() metode User schemy bolo returnute false) >> zamietnutie
        if (!user.authUser(password)) {
            return res
                .status(401)
                .json({ error: "Invalid credentials, please try again" });
        }
        //pokial bol user najdeny ale heslo bolo spravne zadane (v authUser() v User modeli funkcii bolo returnute true) >> generovanie tokenu
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

        //vytvorime cookie so zivotnostou jednej hodiny ktory v sebe drzi token uzivatela, bez neho nie je autorizovatelny, toto bude pouzite ako nutnost sa relohnut po nejakom case
        res.cookie("token", token, { expire: new Date() + 3600 });

        //return usera s tokenom na FE
        console.log(`API (LOGIN) > USER ${user.username} LOGGED IN:`, user, {
            token,
        });
        return res.status(200).json({
            token: token,
            user: { username: user.username, email: user.email, _id: user._id },
        });
    });
};

exports.logoutUser = (req, res, next) => {
    //proste vymazeme cookie s menom token a tym padom odhlasime uzivatela
    res.clearCookie("token");
    res.status(200).json({ message: "User signed out" });
};

exports.requireLogin = expressJWT({
    // funkcia zistuje ci sa v tokene nachadza spravny secret key z .env filu
    userProperty: "auth",
    secret: process.env.JWT_SECRET, // ak ano tak uzivatela pusti dalej, ak nie tak ho zamietne
    algorithms: ["HS256"], // definovane kvoli novej verzii express-jwt
    //pokial je token validny >> expressJWT prida idcko overeneho usera do request objectu vo forme auth klucu
});

exports.forgotPassword = (req, res) => {
    if (!req.body)
        return res.status(400).json({ message: "No request body found" });
    if (!req.body.email)
        return res
            .status(400)
            .json({ message: "No email found in request body" });

    console.log(
        `API (FORGOT PASSWORD) > FINDING USER WITH EMAIL "${req.body.email}"`
    );
    const { email } = req.body;

    User.findOne({ email: email }, (err, user) => {
        if (err || !user) {
            console.log(`API (FORGOT PASSWORD) > USER NOT FOUND`);
            console.log(`API (FORGOT PASSWORD) > RETURNING WITH ERROR`);
            return res
                .status(500)
                .json({ error: "User with that email does not exist" });
        }

        console.log(
            `API (FORGOT PASSWORD) > USER FOUND: ${user.username} (${user})`
        );

        console.log(
            `API (FORGOT PASSWORD) > GENERATING NEW TOKEN FOR USER ${user.username}`
        );
        //vygenerovanie tokenu
        const token = jwt.sign(
            {
                _id: user._id,
                iss: "NODEAPI",
            },
            process.env.JWT_SECRET
        );
        console.log(
            `API (FORGOT PASSWORD) > FINISHED GENERATING NEW TOKEN FOR USER ${user.username}`
        );

        console.log(`API (FORGOT PASSWORD) > CREATING NEW EMAIL MESSAGE`);
        //email data
        const emailData = {
            from: "noreply@socnet-app.com",
            to: email,
            subject: "Password Reset Instrucions",
            text: `Please use the following link to reset you password: ${process.env.CLIENT_RESET_PASSWORD_URL}/reset-password/${token}`,
            html: `<p>Please use the following link to reset you password: </p><p>${process.env.CLIENT_RESET_PASSWORD_URL}/reset-password/${token}</p>`,
        };
        console.log(
            `API (FORGOT PASSWORD) > FINISHED CREATING NEW EMAIL MESSAGE`
        );

        console.log(
            `API (FORGOT PASSWORD) > SENDING EMAIL TO USER ${user.username} ON ${user.email} `
        );
        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.status(500).json({ message: err });
            } else {
                sendEmail(emailData);
                console.log(
                    `API (FORGOT PASSWORD) > EMAIL HAS BEEN SUCCESSFULLY SENT TO USER ${user.username} ON ${user.email} `
                );
                return res.status(200).json({
                    message: `Email has been successfully sent to ${user.email}. Follow the instructions appended in the email to reset your password`,
                });
            }
        });
    });
};

/*
Na to aby si uzivatel vedel zmenit heslo
potrebujem najprv najst v DB uzivatela s jeho "resetPasswordLink"-om
hodnota tohoto resetPasswordLinku sa musi zhodovat s uzivatelskym tokenom
pokial sa uzivatelsky resetPasswordLink(token) zhoduje s prichadzajucim req.body.resetPasswordLink(token) tak mame spravneho uzivatela
>> nasledne mu vieme zmenit heslo
*/

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    User.findOne({ resetPasswordLink }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "Invalid Link",
            });
        }

        console.log(
            `API (RESET PASSWORD) > UPDATING USER (${user.username}) WITH NEW DATA`
        );
        const updatedFields = {
            password: newPassword,
            resetPasswordLink: "",
        };

        user = _.extend(user, updatedFields);
        user.updated = Date.now();
        console.log(
            `API (RESET PASSWORD) > USER ${user.username} UPDATED ON ${user.updated}`
        );

        console.log(`API (RESET PASSWORD) > SAVING USER ${user.username}`);

        user.save((err, result) => {
            if (err) return res.status(500).json({ error: err });
            console.log(
                `API (RESET PASSWORD) > USER ${user.username} SUCCESSFULLY SAVED`
            );
            res.status(200).json({
                message: "Great! Now you can login with your new password",
            });
        });
    });
};
