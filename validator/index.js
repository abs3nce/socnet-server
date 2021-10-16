exports.userRegisterValidator = (req, res, next) => {
  //validator for username
  req.check("username", "Username must not be empty").notEmpty();
  req
    .check("username", "Length of the username must be between 3 to 25 characters")
    .isLength({ min: 3, max: 25 });

  //validator for email
  req.check("email", "Email must not be empty").notEmpty();
  req.check("email").isEmail().withMessage("Invalid form of email");

  //validator for password
  req.check("password", "Password must not be empty").notEmpty();
  req
    .check("password", "Password must be at lease 8 characters long")
    .isLength({ min: 8 })
    .matches(/\d/)
    //matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i"); mozno na test kebyze rovno uzivatela oboznamim s kriteriami na heslo
    //a to 1 cislo, jedno male pismeno, jedno velke pismeno a jeden specialny znak a je minimalne 8 znakov dlhe
    .withMessage("Password must contain at least 1 number");

  //check for error
  const errors = req.validationErrors();
  if (errors) {
    const firstErrorInLine = errors.map((error) => error.msg)[0]; //z errorov ktore su v "errors" zober iba error message "msg" a do "firstErrorInLine" nahraj iba ten prvy ([0])
    return res.status(401).json({ error: firstErrorInLine });
  }
  //pokracovanie v app process loope
  next();
};

// B R O K E N   V A L I D A T O R
// exports.createPostValidator = (req, res, next) => {
//   // tento validator uz nefunguje kedze na vytvorenie
//   // postu pouzivame x-www-formurlencoded data a tento validator vie pracovat
//   // iba s raw json datami, cize treba vymysliet nejaku nahradu

//   //validator for post title
//   //ak je empty hod error "Create a title"
//   req.check("title", "Title must not be empty").notEmpty();
//   //ak je kratsie ako 8 alebo dlhsie ako 150 hod error
//   req
//     .check("title", "The title's length must be between 8 to 150 characters")
//     .isLength({ min: 8, max: 150 });

//   //validator for post body
//   //ak je empty hod error "Create a body"
//   req.check("body", "Body must not be empty").notEmpty();
//   //ak je kratsie ako 8 alebo dlhsie ako 1500 hod error
//   req
//     .check("body", "The body's length must be between 8 and 1500 characters")
//     .isLength({ min: 0, max: 1500 });

//   //check for errors
//   const errors = req.validationErrors(); //urob array errorov

//   //ak nastali nejake errory vo validacii, tak userovi vrat prvy v poradi
//   if (errors) {
//     const firstErrorInLine = errors.map((error) => error.msg)[0]; //z errorov ktore su v "errors" zober iba error message "msg" a do "firstErrorInLine" nahraj iba ten prvy ([0])
//     return res.status(401).json({ error: firstErrorInLine });
//   }

//   //pokracovanie v app process loope
//   next();
// };
