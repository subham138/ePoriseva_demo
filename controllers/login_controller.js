const bodyParser = require('body-parser');
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const loginModule = require('../models/login_model');
const login_model = new loginModule();

// DEFINE BODYPARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// LOGIN INDEX
const login = (req, res, next) => {
    // res.send({ message: "Subham Samanta" });
    // res.render('template/login', { data: JSON.stringify(fs.readFileSync('views/login/login.ejs', 'utf-8')) })
    res.render('login/login')
};

// LOGIN POST
const login_post = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    login_model.login(email, password, (result) => {
        if (result) {
            req.session.user = result;
            res.redirect('/');
            // res.json(result);
        } else {
            res.render('NO DATA FOUND');
        }
    })
};

// REGISTRATION INDEX
const registration = (req, res, next) => {
    res.render('login/register')
};

// REGISTRATION : NEW USER REGISTRATION
const register_save = (req, res, next) => {
    let input = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };
    // console.log(input);
    login_model.create(input, (result) => {
        if (result) {
             res.json(result);
            res.redirect('/login');
        } else {
            console.error("Something Went Wrong To Insert Data !!!!");
        }
    })
};

// FORGOT PASSWORD INDEX
const forgot_password = (req, res, next) => {
    res.render('login/forgot_password');
}

// FORGOT PASSWORD POST MAIL
const post_mail = (req, res, next) => {
    // console.log(req.body.email);

    var body = '<body style="background-color: #e9ecef;">'
        + '<table border="0" cellpadding="0" cellspacing="0" width="100%">'
        + '<tr>'
        + '<td align="center" bgcolor="#e9ecef">'
        + '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">'
        + '<tr>'
        + '<td align="center" valign="top" style="padding: 36px 24px;">'
        + '<a href="https://synergicsoftek.in/" target="_blank" style="display: inline-block;">'
        + '<img src="https://synergicsoftek.in/wp-content/uploads/2020/12/logo2-2.png" alt="Logo" border="0" width="48" style="display: block; width: 48px; max-width: 48px; min-width: 48px;">'
        + '</a>'
        + '</td>'
        + '</tr>'
        + '</table>'
        + '</td>'
        + '</tr>'
        + ' <tr>'
        + '<td align="center" bgcolor="#e9ecef">'
        + '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">'
        + '<tr>'
        + '<td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: "Source Sans Pro", Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">'
        + '<h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Reset Your Password</h1>'
        + '</td>'
        + '</tr>'
        + '</table>'
        + '</td>'
        + '</tr>'
        + '<tr>'
        + '<td align="center" bgcolor="#e9ecef">'
        + '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">'
        + ' <tr>'
        + '<td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: "Source Sans Pro", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">'
        + '<p style="margin: 0;">Tap the button below to reset your customer account password. If you didnt request a new password, you can safely delete this email.</p>'
        + '</td>'
        + '</tr>'
        + '<tr>'
        + '<td align="left" bgcolor="#ffffff">'
        + ' <table border="0" cellpadding="0" cellspacing="0" width="100%">'
        + '<tr>'
        + '<td align="center" bgcolor="#ffffff" style="padding: 12px;">'
        + '<table border="0" cellpadding="0" cellspacing="0">'
        + '<tr>'
        + '<td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">'
        + ' <a href="https://sendgrid.com" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: "Source Sans Pro", Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Do Something Sweet</a>'
        + '</td>'
        + '</tr>'
        + '</table>'
        + '</td>'
        + '</tr>'
        + '</table>'
        + '</td>'
        + '</tr>'
        + '<tr>'
        + '<td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: "Source Sans Pro", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">'
        + ' <p style="margin: 0;">If that doesnt work, copy and paste the following link in your browser:</p>'
        + '<p style="margin: 0;"><a href="https://sendgrid.com" target="_blank">https://same-link-as-button.url/xxx-xxx-xxxx</a></p>'
        + '</td>'
        + '</tr>'
        + '<tr>'
        + '<td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: "Source Sans Pro", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">'
        + '<p style="margin: 0;">Cheers,<br> Paste</p>'
        + '</td>'
        + '</tr>'
        + '</table>'
        + '</td>'
        + '</tr>'
        + '</table>';


    /////////// Less secure app access : https://myaccount.google.com/lesssecureapps
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'samantasubham9804@gmail.com', // like : abc@gmail.com
            pass: 'subhamswtboy'           // like : pass@123
        }
    });

    var mailOptions = {
        from: 'samantasubham9804@gmail.com',
        to: req.body.email,
        subject: 'Forget Password',
        html: body
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            res.redirect('/login');
            console.log('Email sent: ' + info.response);
        }
    });
};
// const

// SIGN OUT
const sign_out = (req, res, next) => {
    if (req.session.user) {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    }
}

// EXPORT MODULES
module.exports = {
    login,
    login_post,
    registration,
    register_save,
    forgot_password,
    post_mail,
    sign_out
}