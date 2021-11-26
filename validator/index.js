exports.userRegisterValidator = (req, res, next) => {
    //username check
    req.check("username", "Username must not be empty").notEmpty();
    req.check(
        "username",
        "Length of the username must be between 3 to 25 characters"
    ).isLength({ min: 3, max: 25 });

    //email check
    req.check("email", "Email must not be empty").notEmpty();
    req.check("email").isEmail().withMessage("Invalid form of email");

    //password check
    req.check("password", "Password must not be empty").notEmpty();
    req.check("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/\d/)
        //matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i"); mozno na test kebyze rovno uzivatela oboznamim s kriteriami na heslo
        //a to 1 cislo, jedno male pismeno, jedno velke pismeno a jeden specialny znak a je minimalne 8 znakov dlhe
        .withMessage("Password must contain at least 1 number");

    //check for error
    const errors = req.validationErrors();
    if (errors) {
        const firstErrorInLine = errors.map((error) => error.msg)[0]; //z errorov ktore su v "errors" zober iba error message "msg" a do "firstErrorInLine" nahraj iba ten prvy ([0])
        return res.status(401).json({ error: firstErrorInLine }); //cize ukaz iba prvy z errorov ktore sa vyskytli
    }
    //pokracovanie v app process loope
    next();
};

exports.passwordResetValidator = (req, res, next) => {
    //password check
    req.check("newPassword", "Password must not be empty").notEmpty();
    req.check("newPassword")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/\d/)
        .withMessage("Password must contain at least 1 number");
    //matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i"); mozno na test kebyze rovno uzivatela oboznamim s kriteriami na heslo
    //a to 1 cislo, jedno male pismeno, jedno velke pismeno a jeden specialny znak a je minimalne 8 znakov dlhe

    const errors = req.validationErrors();
    if (errors) {
        const firstErrorInLine = errors.map((error) => error.msg)[0]; //z errorov ktore su v "errors" zober iba error message "msg" a do "firstErrorInLine" nahraj iba ten prvy ([0])
        return res.status(401).json({ error: firstErrorInLine }); //cize ukaz iba prvy z errorov ktore sa vyskytli
    }
    //pokracovanie v app process loope
    next();
};
