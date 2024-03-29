const Sequelize = require("sequelize");
const sequelize = require("../database/connection");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Repository = require("../models/Repository");
const cookieParser = require("cookie-parser");
const message = require(".././constants");
const Timelog = require("../models/Timelog");

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
  const userType = req.cookies.userData.userType;
  const jwtToken = req.cookies.jwt;

  if (req.params.id == id) {
    // user ID passed through params matches with the user ID stores in cookies.
    // Displaying all the repos on Dashboard

    //Getting all the repos
    const allRepositories = await Repository.findAll({ raw: true });
    res.cookie("allRepositories", allRepositories);

    res.render("dashboard", {
      firstName,
      allRepositories,
      jwtToken,
      id,
      userType,
    });
  } else {
    //User is trying to pass some other ID in the params that does not match with the ID stored in cookies.
    res.redirect("/signin");
  }
};

const signupUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const userType = "admin";
  let errors = [];

  //Validation
  if (!firstName || !lastName || !email || !password) {
    errors.push({ msg: message.fillAllFields });
  }

  //Validation
  if (password.length < 6) {
    errors.push({ msg: message.passwordValidation });
  }

  if (errors.length > 0) {
    res.render("signup", { errors, firstName, lastName, email, password });
  } else {
    //User exist Validation
    const match = await User.findOne({ where: { email: email } });

    if (match) {
      errors.push({ msg: message.incorrectInputs });
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
        userType: userType,
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
    signinErrors.push({ msg: message.fillAllFields });
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

      //Get the user sign in time.
      res.cookie("SigninTimestamp", Date.now());

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
      signinErrors.push({ msg: message.incorrectInputs });
      res.render("signin", { signinErrors: signinErrors });
    }
  } else {
    //User Does not Exist
    // return res.status(401).send("User does not exist");
    signinErrors.push({ msg: message.incorrectInputs });
    res.render("signin", { signinErrors: signinErrors });
  }
};

const logoutUser = async (req, res) => {
  //Finding the signed in elapsed time.
  const totalLoginTime = Date.now() - req.cookies.SigninTimestamp;
  const seconds = Math.floor((totalLoginTime / 1000) % 60);
  const minutes = Math.floor((totalLoginTime / 1000 / 60) % 60);
  const hours = Math.floor(totalLoginTime / 1000 / 60 / 60);
  const humanized = [
    pad(hours.toString(), 2),
    pad(minutes.toString(), 2),
    pad(seconds.toString(), 2),
  ].join(":");

  console.log("Total Sign in Time:" + humanized);

  //Storing the elapsed time in timelog table.

  try {
    const timelog = await Timelog.create({
      userId: req.cookies.userData.id,
      timeElapsed: humanized,
    });

    if (timelog) {
      console.log(timelog);
    }
  } catch (err) {
    console.log(err);
  }

  //Setting cookie values to empty string and setting age to 1ms.
  res.cookie("jwt", "", { maxAage: 1 });
  res.cookie("userData", "", { maxAage: 1 });
  res.cookie("allRepositories", "", { maxAage: 1 });
  res.cookie("SigninTimestamp", "", { maxAage: 1 });
  res.cookie("yourRepositories", "", { maxAage: 1 });
  res.cookie("editRepository", "", { maxAage: 1 });
  res.cookie("selectedUserID", "", { maxAage: 1 });

  res.redirect("/");
};

const pad = (numberString, size) => {
  let padded = numberString;
  while (padded.length < size) padded = `0${padded}`;
  return padded;
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

  res.render("editUser", { id, firstName, lastName });
};

const saveEditUser = async (req, res) => {
  let editErrors = [];
  const id = req.cookies.userData.id;
  const { firstName, lastName, password } = req.body;

  if (!firstName || !lastName || !password) {
    editErrors.push({ msg: message.fillAllFields });
  }

  //Validation
  if (password.length < 6) {
    editErrors.push({ msg: message.passwordLengthValidation });
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

const renderSuperAdminSignupPage = (req, res) => {
  res.render("superAdminSignup");
};

const superAdminSignup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const userType = "superAdmin";
  let errors = [];

  //Validation
  if (!firstName || !lastName || !email || !password) {
    errors.push({ msg: message.fillAllFields });
  }

  //Validation
  if (password.length < 6) {
    errors.push({ msg: message.passwordLengthValidation });
  }

  if (errors.length > 0) {
    res.render("superAdminSignup", {
      errors,
      firstName,
      lastName,
      email,
      password,
    });
  } else {
    //User exist Validation
    const match = await User.findOne({ where: { email: email } });

    if (match) {
      errors.push({ msg: message.incorrectInputs });
      res.render("superAdminSignup", {
        errors,
        firstName,
        lastName,
        email,
        password,
      });
    } else {
      //Password Hashing Logic
      const saltRounds = 8;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        userType: userType,
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
        res.render("superAdminSignup", {
          errors,
          firstName,
          lastName,
          email,
          password,
        });
      }
    }
  }
};

const renderAllUsersPage = async (req, res) => {
  const userType = "admin";
  const id = req.cookies.userData.id;
  const firstName = req.cookies.userData.firstName;

  try {
    const allUsers = await User.findAll(
      { where: { userType: userType } },
      { raw: true }
    );
    res.render("allUsers", { allUsers, id, firstName });
  } catch (err) {
    console.log(err);
  }
};

const renderEditAllUsersPage = async (req, res) => {
  let id = req.params.id;

  //Storing the id in cookie.
  res.cookie("selectedUserID", id);

  const userType = "admin";

  //query to get the first name and last name using ID.

  try {
    const editUser = await User.findOne({ where: { id: id } }, { raw: true });
    console.log("Edit User data: ", editUser);
    //The user data is gathered from the editUser object.
    const { firstName, lastName } = editUser;
    res.render("allUsersEdit", { id, firstName, lastName });
  } catch (err) {
    console.log(err);
  }
};

const updateAdminUser = async (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  let id = req.cookies.selectedUserID;
  let errors = [];

  if (!firstName || !lastName) {
    errors.push({ msg: message.fillAllFields });
  }
  if (errors.length > 0) {
    res.render("allUsersEdit", { id, firstName, lastName, errors });
  } else {
    try {
      const editUser = await User.update(
        { firstName, lastName },
        { where: { id: id } }
      );

      if (editUser) {
        id = req.cookies.userData.id;

        //refreshing the data.
        const allUsers = await User.findAll(
          { where: { userType: "admin" } },
          { raw: true }
        );
        res.render("allUsers", { allUsers, id, firstName });
      } else {
        res.render("allUsersEdit", { id, firstName, lastName });
      }
    } catch (err) {
      console.log(err);
    }
  }
};

const deleteAdminUser = async (req, res) => {
  let id = req.params.id;
  const userType = "admin";
  const firstName = req.cookies.userData.firstName;

  try {
    const isDeleted = await User.destroy({ where: { id: id } });
    if (isDeleted) {
      //Refreshing the data
      id = req.cookies.userData.id;
      const allUsers = await User.findAll({ where: { userType: userType } });
      res.render("allUsers", { allUsers, id, firstName });
    }
  } catch (err) {
    console.log(err);
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
  renderSuperAdminSignupPage,
  superAdminSignup,
  renderAllUsersPage,
  renderEditAllUsersPage,
  deleteAdminUser,
  updateAdminUser,
};
