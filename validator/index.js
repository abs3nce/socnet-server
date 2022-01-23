exports.userRegisterValidator = (req, res, next) => {
    //username check
    req.check("username", "Meno nesmie ostať prázdne").notEmpty();
    req.check("username", "Meno musí mať maximálne 32 znakov").isLength({
        min: 1,
        max: 32,
    });

    //email check
    req.check("email", "Email nesmie ostať prázdny").notEmpty();
    req.check("email").isEmail().withMessage("Nesprávna forma emailu");

    //password check
    req.check("password", "Heslo nesmie ostať byť prázdne").notEmpty();
    req.check("password")
        .isLength({ min: 8 })
        .withMessage("Heslo musí mať aspoň 8 znakov")
        .matches(/\d/)
        //matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i"); mozno na test kebyze rovno uzivatela oboznamim s kriteriami na heslo
        //a to 1 cislo, jedno male pismeno, jedno velke pismeno a jeden specialny znak a je minimalne 8 znakov dlhe
        .withMessage("Heslo musí obsahovať aspon jedno číslo");

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
    req.check("newPassword", "Heslo nesmie ostať byť prázdne").notEmpty();
    req.check("newPassword")
        .isLength({ min: 8 })
        .withMessage("Heslo musí mať aspoň 8 znakov")
        .matches(/\d/)
        .withMessage("Heslo musí obsahovať aspon jedno číslo");
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
