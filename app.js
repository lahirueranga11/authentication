//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));


let db;
mongoose.connect('mongodb://127.0.0.1:27017/userDB').then((dbConnection) =>
{
    db = dbConnection;
    afterwards();

});
function afterwards()
{
    const userSchema = new mongoose.Schema({
        email: String,
        password: String
    });

    const secret = "Thisisourlittlesecret.";
    userSchema.plugin(encrypt, {
        secret: process.env.SECRET, 
        encryptedFields: ["password"]
    });

    const User = new mongoose.model("User", userSchema);


    app.listen(3000, function ()
    {
        console.log("Server started in port 3000");
    });

    app.get("/", function (req, res)
    {
        res.render("home");
    });
    //---------Login route
    app.route("/login")
        .get(function (req, res)
        {
            res.render("login");
        })
        .post(function (req, res)
        {
            const userName = req.body.username;
            const password = req.body.password;

            User.findOne({ email: userName }).then(foundUser =>
            {
                if (foundUser) {
                    if (foundUser.password === password) {

                        res.render("secrets");
                    }
                    else {
                        console.log("username or password doesn't match");
                    }
                    console.log(foundUser.password + " " + password);
                }
                else {
                    console.log("user not found");

                }
            }).catch(err =>
            {
                console.log(err);
            });
        });

    //---------Register route
    app.route("/register")
        .get(function (req, res)
        {
            res.render("register");
        })
        .post(function (req, res)
        {
            const newUser = new User({
                email: req.body.username,
                password: req.body.password
            });

            newUser.save()
                .then(() =>
                {
                    res.render("secrets");
                })
                .catch(err =>
                {
                    console.log(err);
                });
        });
}