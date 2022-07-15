const jwt = require("jsonwebtoken");
const requireAuth = (req, res, next) => {
  //Getting Token from Browser's local storage.
  const token = req.cookies.jwt;

  //If token exist in browser cookies
  if (token) {
    jwt.verify(
      token,
      "fkdgkjanfdkjasndfjsandflsakdnflsadjf",
      (err, decodedToken) => {
        if (err) {
          //Token is not verified.
          console.log(err);
          res.redirect("/login");
        } else {
          //Token is verified.
          console.log(decodedToken);
          next();
        }
      }
    );
  } else {
    //If token does not exist in browser cookies.
    res.redirect("/signin");
  }
};

module.exports = { requireAuth };
