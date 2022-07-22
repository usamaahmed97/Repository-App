const Sequelize = require("sequelize");
const sequelize = require("../database/connection");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Repository = require("../models/Repository");
const cookieParser = require("cookie-parser");

const renderHomePage = (req, res) => {
  res.render("home");
};

const renderSignupPage = (req, res) => {
  res.render("signup");
};

const renderSigninPage = (req, res) => {
  res.render("signin");
};

const renderDashboard = async (req, res) => {
  // Find the signed in user ID from the cookies.

  const id = req.cookies.userData.id;
  const firstName = req.cookies.userData.firstName;
  const secondName = req.cookies.userData.secondName;
  const email = req.cookies.userData.email;
  const jwtToken = req.cookies.jwt;

  if (req.params.id == id) {
    // user ID passed through params matches with the user ID stores in cookies.
    // Displaying all the repos on Dashboard

    //Getting all the repos
    const allRepositories = await Repository.findAll({ raw: true });
    res.cookie("allRepositories", allRepositories);

    res.render("dashboard", { firstName, allRepositories, jwtToken, id });
  } else {
    //User is trying to pass some other ID in the params that does not match with the ID stored in cookies.
    res.redirect("/signin");
  }
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
        let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1hr",
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
    const isSame = await bcrypt.compare(password, user.password);

    if (isSame) {
      //Password Matches

      //Store the user in a cookie.
      res.cookie("userData", user);

      // 3. Generate a token with the user id using ( JWT )
      let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1hr",
      });

      //4.  Set a cookie with Cookie-Parser for the user
      res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
      console.log("user", JSON.stringify(user, null, 2));
      console.log(token);

      //5. send user data
      // return res.status(201).send(user);

      res.redirect("/dashboard/" + user.id);
    } else {
      //Password Does not Match
      // return res.status(401).send("Password does not match.");
      signinErrors.push({ msg: "Password does not match. " });
      res.render("signin", { signinErrors: signinErrors });
    }
  } else {
    //User Does not Exist
    // return res.status(401).send("User does not exist");
    signinErrors.push({ msg: "User does not exist." });
    res.render("signin", { signinErrors: signinErrors });
  }
};

const logoutUser = async (req, res) => {
  //Setting jwt token to empty string and setting its age to 1ms.
  res.cookie("jwt", "", { maxAage: 1 });
  res.cookie("userData", "", { maxAage: 1 });
  res.cookie("allRepositories", "", { maxAage: 1 });
  res.redirect("/");
};

const deleteUser = async (req, res) => {
  const id = req.cookies.userData.id;
  const firstName = req.cookies.userData.firstName;

  try {
    const isDeleted = await User.destroy({ where: { id: id } });
    if (isDeleted) {
      res.redirect("/");
    } else {
      const allRepositories = req.cookies.allRepositories;
      res.render("dashboard", { firstName, allRepositories, id });
    }
  } catch (err) {
    console.log(err);
  }
};

const renderEditUserPage = async (req, res) => {
  const id = req.cookies.userData.id;
  const firstName = req.cookies.userData.firstName;
  const lastName = req.cookies.userData.lastName;

  res.render("editUser", { id, firstName, lastName});
};

const saveEditUser = async (req, res) => {
  let editErrors = [];
  const id = req.cookies.userData.id;
  const { firstName, lastName, password } = req.body;

  if (!firstName || !lastName || !password) {
    editErrors.push({ msg: "Please fill in all fields." });
  }

  //Validation
  if (password.length < 6) {
    editErrors.push({ msg: "Password should be atleast 6 characters." });
  }

  if (editErrors.length > 0) {
    res.render("editUser", { id, firstName, lastName, editErrors });
  } else {
    const saltRounds = 8;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    try {
      const editUser = await User.update(
        { firstName, lastName, password: hashedPassword },
        { where: { id: id } }
      );

      if (editUser) {
        const user = await User.findOne({ where: { id: id } });
        res.cookie("userData", user);
        res.redirect(`dashboard/${id}`);
      } else {
        res.render("editUser", { id, firstName, lastName, editErrors });
      }
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports = {
  renderHomePage,
  renderSignupPage,
  renderSigninPage,
  renderDashboard,
  signupUser,
  signinUser,
  logoutUser,
  deleteUser,
  renderEditUserPage,
  saveEditUser,
};
