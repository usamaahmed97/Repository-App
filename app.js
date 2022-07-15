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
const app = express();

const {
  renderHomePage,
  renderSignupPage,
  renderSigninPage,
  renderDashboard,
  signupUser,
  signinUser,
  logoutUser
} = require("./controllers/userAPI");
const User = require("./models/User");

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

//HOME PAGE RENDERING
app.get("/", renderHomePage);
app.get("/signin", renderSigninPage);
app.get("/signup", renderSignupPage);
app.post("/signup", signupUser);
app.post("/signin", signinUser);
app.get('/logout', logoutUser);


//Protected Routes
app.get("/dashboard", requireAuth, renderDashboard);

//Port Listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is connected on ${PORT}`));
