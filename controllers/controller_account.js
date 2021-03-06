//obsahuje logiku ktorou sa bude riesit prihlasovanie uzivatela, registracia, odhlasovanie a veci okolo jeho uctu
const User = require("../schemes/scheme_user");
const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");
const dotenv = require("dotenv");
require("dotenv").config();
dotenv.config();
const _ = require("lodash");
const { sendEmail } = require("../helpers/mailer");
// load env

exports.registerUser = async (req, res, next) => {
    //checkni pre duplikovany ucet
    //pokial tento user uz existuje tak zamietni registraciu

    console.log(
        `API (REGISTER) > USER ${req.body.username} ATTEMPTING TO REGISTER WITH DATA: `,
        req.body
    );

    usernameExists = await User.findOne({ username: req.body.username });
    if (usernameExists) {
        console.log(
            `API (REGISTER) > USER REGISTRATION DENIED, USERNAME ALREADY EXISTS (${req.body.username})`
        );
        return res.status(401).json({ error: "Užívateľské meno už existuje" });
    }

    emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
        console.log(
            `API (REGISTER) > USER REGISTRATION DENIED, EMAIL ALREADY EXISTS (${req.body.email})`
        );
        return res.status(401).json({ error: "Email už existuje" });
    }

    console.log(
        `API (REGISTER) > USER ${req.body.username} IS VALID AND READY TO BE SAVED`
    );

    const user = await new User(req.body); //pokial tento user neexistoval >> vytvor novy instance Usera s udajmi z FE
    await user.save(); //uloz ho do DB a na FE posli response s udajmi

    console.log(`API (REGISTER) > SAVING USER TO DB: `, user);
    console.log(`API (REGISTER) > USER ${req.body.username} SAVED TO DB`);
    res.status(200).json({
        user: {
            username: user.username,
            email: user.email,
            _id: user._id,
            created: user.created,
        },
        message: "Registrácia prebehla úspešne",
    });
};

exports.loginUser = (req, res, next) => {
    //najdenie usera na zaklade username
    const { _id, username, password } = req.body;

    console.log(
        `API (LOGIN) > USER ${username} ATTEMPTING TO LOGIN WITH DATA: `,
        req.body
    );
    User.findOne({ username: username }, (err, user) => {
        //pokial nastali nejake errory
        if (err) {
            console.log(`API (LOGIN) > INTERNAL SERVER ERROR`);
            return res.status(500).json({ error: "Internal server error" });
        }

        //pokial user nebol najdeny
        if (!user) {
            console.log(`API (LOGIN) > USER ${username} NOT FOUND`);
            return res
                .status(401)
                .json({ error: "Nesprávne údaje, skúste znova" });
        }
        //pokial bol user najdeny ale heslo bolo zle zadane (v authUser() metode User schemy bolo returnute false) >> zamietnutie
        if (!user.authUser(password)) {
            console.log(
                `API (LOGIN) > USER ${username} DENIED, INVALID CREDENTIALS`
            );
            return res
                .status(401)
                .json({ error: "Nesprávne údaje, skúste znova" });
        }
        console.log(`API (LOGIN) > USER ${username} FOUND`);
        console.log(`API (LOGIN) > USER ${username} HAS VALID CREDENTIALS`);
        console.log(`API (LOGIN) > GENERATING TOKEN FOR USER ${username}`);

        //pokial bol user najdeny ale heslo bolo spravne zadane (v authUser() v User modeli funkcii bolo returnute true) >> generovanie tokenu
        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET
        );

        //vytvorime cookie so zivotnostou jednej hodiny ktory v sebe drzi token uzivatela, bez neho nie je autorizovatelny, toto bude pouzite ako nutnost sa relohnut po nejakom case
        res.cookie("token", token, { expire: new Date() + 3600 });

        //return usera s tokenom na FE
        console.log(`API (LOGIN) > USER ${user.username} LOGGED IN:`, user, {
            token,
        });
        return res.status(200).json({
            token: token,
            user: {
                username: user.username,
                email: user.email,
                _id: user._id,
                role: user.role,
            },
        });
    });
};

exports.logoutUser = (req, res, next) => {
    //proste vymazeme cookie s menom token a tym padom odhlasime uzivatela
    res.clearCookie("token");
    res.status(200).json({ message: "Užívateľ odhlásený" });
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
        return res.status(400).json({ message: "Problém so zmenou hesla" });
    if (!req.body.email)
        return res
            .status(400)
            .json({ message: "Email nenájdený v request.body" });

    console.log(
        `API (FORGOT PASSWORD) > FINDING USER WITH EMAIL "${req.body.email}"`
    );
    const { email } = req.body;

    User.findOne({ email: email }, (err, user) => {
        if (err || !user) {
            console.log(`API (FORGOT PASSWORD) > USER NOT FOUND`);
            console.log(`API (FORGOT PASSWORD) > RETURNING WITH ERROR`);
            return res.status(500).json({
                error: "Užívateľ s touto emailovou adresou neexistuje. Skúste inú adresu",
            });
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
            subject: "Inštrukcie na zmenu hesla",
            text: `Prosím použite následujúci link na zmenu hesla: ${process.env.CLIENT_RESET_PASSWORD_URL}/reset-password/${token}`,
            html: `<p>Prosím použite následujúci link na zmenu hesla: </p><p>${process.env.CLIENT_RESET_PASSWORD_URL}/reset-password/${token}</p>`,
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
                    message: `Email bol úspešne zaslaný na ${user.email}. Pre ďalšie inštrukcie skontrolujte schránku alebo spam.`,
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

        const updatedFields = {
            password: newPassword,
            resetPasswordLink: "",
        };
        console.log(
            `API (RESET PASSWORD) > UPDATING USER (${user.username}) WITH NEW PASSWORD: ${updatedFields.password}`
        );

        user = _.extend(user, updatedFields);
        user.updated = Date.now();
        console.log(
            `API (RESET PASSWORD) > USER ${user.username} UPDATED ON ${user.updated}`
        );

        console.log(`API (RESET PASSWORD) > SAVING USER ${user.username}`);

        user.save((err, result) => {
            if (err) return res.status(500).json({ error: err });
            console.log(
                `API (RESET PASSWORD) > USER ${user.username} SUCCESSFULLY SAVED WITH NEW DATA: `,
                user
            );
            res.status(200).json({
                message:
                    "Zmena hesla úspešná. Teraz sa prihláste s novým heslom",
            });
        });
    });
};
