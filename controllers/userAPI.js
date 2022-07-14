const Sequelize = require("sequelize");
const sequelize = require("../database/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const renderHomePage = (req, res) => {
  res.render("home");
};

const renderSignupPage = (req, res) => {
  res.render("signup");
};

const renderSigninPage = (req, res) => {
  res.render("signin");
};

const renderDashboard = (req, res) => {
  res.render("dashboard");
};

const signupUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  let errors = [];

  //Validation
  if (!firstName || !lastName || !email || !password) {
    errors.push({ msg: "Please fill in all fields." });
  }

  //Validation
  if (password.length < 6) {
    errors.push({ msg: "Password should be atleast 6 characters." });
  }

  if (errors.length > 0) {
    res.render("signup", { errors, firstName, lastName, email, password });
  } else {
    //User exist Validation
    const match = await User.findOne({ where: { email: email } });

    if (match) {
      errors.push({ msg: "Email already registered." });
      res.render("signup", { errors, firstName, lastName, email, password });
    } else {
      //Password Hashing Logic
      const saltRounds = 8;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
      });

      if (user) {
        let token = jwt.sign({ id: user.id }, "ydwygyegyegcveyvcyegc", {
          expiresIn: 1 * 24 * 60 * 60 * 1000,
        });
        res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
        console.log("user", JSON.stringify(user, null, 2));
        console.log("Token: " + token);
        //send users details

        res.redirect("/signin");
      } else {
        res.render("signup", { errors, firstName, lastName, email, password });
      }
    }
  }
};

// Login Logic
const signinUser = async (req, res) => {
  let signinErrors = [];

  // 1. Find email of the the request in the database, if exist
  const { email, password } = req.body;

  if (!email || !password) {
    signinErrors.push({ msg: "Please fill in all fields." });
  }

  if (signinErrors.length > 0) {
    res.render("signin", { signinErrors: signinErrors });
  }

  const user = await User.findOne({ where: { email: email } });

  if (user) {
    //User Exist Case

    // 2. Compares the password with existing password in the database.
    const { password: hashedPasswored } = user;
    console.log(`password: ${password} hashed: ${hashedPasswored}`);
    const isSame = await bcrypt.compare(password, user.password);

    if (isSame) {
      //Password Matches

      // 3. Generate a token with the user id using ( JWT )
      let token = jwt.sign({ id: user.id }, process.env.secretKey, {
        expiresIn: 1 * 24 * 60 * 60 * 1000,
      });

      //4.  Set a cookie with Cookie-Parser for the user
      res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
      console.log("user", JSON.stringify(user, null, 2));
      console.log(token);

      //5. send user data
      // return res.status(201).send(user);
      res.redirect("/dashboard");
    } else {
      //Password Does not Match
      // return res.status(401).send("Password does not match.");
      signinErrors.push({ msg: "Password does not match. " });
      res.render("signin", { signinErrors: signinErrors });
    }
  } else {
    //User Does not Exist
    // return res.status(401).send("User does not exist");
    signinErrors.push({ msg: "User does not exist " });
    res.render("signin", { signinErrors: signinErrors });
  }
};

module.exports = {
  renderHomePage,
  renderSignupPage,
  renderSigninPage,
  renderDashboard,
  signupUser,
  signinUser,
};
