const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const sequelize = require('./database/connection');
require("dotenv").config();
const app = express();
const {renderRegisterPage, registerUser, renderLoginPage, loginUser } = require('./api/userAPI');

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("views"));

// DATABASE CONNECTION
sequelize.authenticate()
    .then(() => {console.log("DB Connected")})
    .catch((err) =>{console.log(`DB Connection Error: ${err}`)});

//PAGE RENDERING
app.get('/', (req, res)=>{
    res.render('home');
})

// USER APIs
app.get('/api/register', renderRegisterPage);
app.post('/api/register', registerUser);
app.get("/api/login", renderLoginPage);
app.post('/api/login', loginUser);

// REPOSITORY APIs



const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{console.log(`Server running on Port ${PORT}`)})