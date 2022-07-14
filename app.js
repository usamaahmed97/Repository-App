const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const sequelize = require("./database/connection");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const flash = require("express-flash");
const session = require("express-session");
const dotenv = require("dotenv").config();
const app = express();

const {
  renderHomePage,
  renderSignupPage,
  renderSigninPage,
  renderDashboard,
  signupUser,
  signinUser,
} = require("./controllers/userAPI");
const User = require("./models/User");

//EJS
app.set("view engine", "ejs");

//Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("views"));

//Express Session
app.use(flash());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

//Connect Flash
app.use(flash());

//Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// DATABASE CONNECTION
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
app.get("/dashboard", renderDashboard);

app.post("/signup", signupUser);
app.post("/signin", signinUser);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is connected on ${PORT}`));
