exports.createPostValidator = (req, res, next) => {
  //validator for post title

  //ak je empty hod error "Create a title"
  req.check("title", "Title must not be empty").notEmpty();
  //ak je kratsie ako 8 alebo dlhsie ako 150 hod error
  req
    .check("title", "The title's length must be between 8 to 150 characters")
    .isLength({ min: 8, max: 150 });

  //validator for post body

  //ak je empty hod error "Create a body"
  req.check("body", "Body must not be empty").notEmpty();
  //ak je kratsie ako 8 alebo dlhsie ako 1500 hod error
  req
    .check("body", "The body's length must be between 8 and 1500 characters")
    .isLength({ min: 8, max: 1500 });

  //check for errors
  const errors = req.validationErrors();

  //ak nastali nejake errory vo validacii, tak userovi vrat prvy v poradi
  if (errors) {
    const firstErrorInLine = errors.map((error) => error.msg)[0]; //z errorov ktore su v "errors" zober iba error message "msg" a do "firstErrorInLine" nahraj iba ten prvy ([0])
    return res.status(401).json({ error: firstErrorInLine });
  }

  //pokracovanie v app loope
  next();
};

exports.userRegisterValidator = (req, res, next) => {
  //validator for username
  req.check("username", "Username must not be empty").notEmpty();
  req
    .check("username", "Username's length must be between 3 to 25 characters")
    .isLength({ min: 3, max: 25 });

  //validator for password
  req.check("password", "Password must not be empty").notEmpty();
  req
    .check("password", "Password's length must be at least 8 characters")
    .isLength({ min: 8 })
    .matches(/\d/)
    .withMessage("Password must contain at least 1 number");

  //check for error
  const errors = req.validationErrors();
  if (errors) {
    const firstErrorInLine = errors.map((error) => error.msg)[0]; //z errorov ktore su v "errors" zober iba error message "msg" a do "firstErrorInLine" nahraj iba ten prvy ([0])
    return res.status(401).json({ error: firstErrorInLine });
  }
  //pokracovanie v app loope
  next();
};
