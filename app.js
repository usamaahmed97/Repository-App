const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const sequelize = require("./database/connection");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const { requireAuth } = require("./middleware/auth");
const User = require("./models/User");
const Repository = require("./models/Repository");
 

const app = express();

const {
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
} = require("./controllers/userAPI");

const {
  renderYourRepositoriesPage,
  createRepositoryPage,
  createYourRepository,
  deleteYourRepositories,
  renderEditRepositoriesPage,
  editRepository,
} = require("./controllers/repositoryAPI");

//EJS
app.set("view engine", "ejs");

//BODY PARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("views"));

//EXPRESS SESSION
app.use(flash());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

//CONNECT FLASH
app.use(flash());

//GLOBAL VARIABLES FOR EJS
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//DATABASE CONNECTION
sequelize
  .authenticate()
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(`DB Connection Error: ${err}`);
  });

  

//HOME PAGE
app.get("/", renderHomePage);

//SIGN IN
app.get("/signin", renderSigninPage);
app.post("/signin", signinUser);
app.get("/logout", logoutUser);

//SIGN UP
app.get("/signup", renderSignupPage);
app.post("/signup", signupUser);

//DASHBOARD
app.get("/dashboard/:id", requireAuth, renderDashboard);

//EDIT PAGE
app.get("/editUser", requireAuth, renderEditUserPage);
app.get("/deleteUser", requireAuth, deleteUser);
app.post("/saveEditUser", requireAuth, saveEditUser);

//REPOSITORIES
app.get("/yourRepositories", requireAuth, renderYourRepositoriesPage);
app.get("/createRepository", requireAuth, createRepositoryPage);
app.post("/createYourRepository", requireAuth, createYourRepository);
app.get("/yourRepositories/:id/delete", requireAuth, deleteYourRepositories);
app.get("/yourRepositories/:id/edit", requireAuth, renderEditRepositoriesPage);
app.post("/yourRepositories/edit", requireAuth, editRepository);
//Port Listener
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is connected on ${PORT}`));
