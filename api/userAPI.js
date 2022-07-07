const sequelize = require("../database/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

renderRegisterPage = (req, res) => {};

registerUser = (req, res) => {};

renderLoginPage = (req, res) => {};

loginUser = (req, res) => {};

module.export = {
  renderRegisterPage,
  registerUser,
  renderLoginPage,
  loginUser,
};
