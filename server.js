const path = require('path');
const express = require('express');
const ejs = require('ejs');
const fs = require('fs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const session = require('express-session');
const http = require('http');
var port = process.env.PORT || 3001;

const db = require('./core/database');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

///////////////////// INCLUDE ROUTERS ///////////////////////////////
const loginRouter = require('./routes/loginRoute');
const payRouter = require('./routes/payRouter');
const tnxRouter = require('./routes/tnxRoute');
const complnRoute = require('./routes/cmplnRoute');
////////////////////////////////////////////////////////////////////

// DEFINE VIEW FILES
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/assets'));
// app.use('/*', express.static('views/template/header.ejs'));

// SET VIEW ENGINE
app.set('view engine', 'ejs');
app.locals.basePATH = __dirname;
// app.engine('html', require('ejs').renderFile);
// app.engine('css', require('ejs').renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// SET SESSION
app.use(session({
    secret: 'BBPS COU HUB',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000
    }
}));
// Use Session in all view pages
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.active = req.path.split('/')[1];
    next();
})

// INDEX PAGE
app.get('/', (req, res) => {
    //let connection = mysql.createConnection({
    //host: 'localhost',
    //user: 'test',
    //password: 'gi#9qE19',
    //database: 'admin_testing'
    //});

    //connection.connect(function(err) {
    //if (err) {
    //res.end('error: ' + err.message);
    //}

    //else {res.end('Connected to the MySQL server.')};
    //});


    let user = req.session.user;
    //console.log(user);
    if (user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }

});

// LOGIN PAGE
app.use(loginRouter);

// PAYMENT SAMPLE PAGE
app.use(payRouter);

// SEARCH TRANSACTION STATUS
app.use(tnxRouter);

// REGISTER COMPLAINT
app.use(complnRoute);

// SAMPLE PAGE
app.get('/sample', (req, res) => {
    res.render('pages/sample');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard/view');
})

app.post('/reg', (req, res) => {
    let input = {
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    };
    let sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.query(sql, [input.name, input.email, input.password], (err, lastId) => {
        //if (err) throw err;
        res.redirect('/login');
    });
    //res.end(input.password);
})

// FETCH DATA AND BIND IN TABLE
app.get('/fetch', (req, res, next) => {
    let sql = `SELECT * FROM users`;
    db.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.render('login/fetch', {
            userdata: data
        });
    });
});
app.get('/update/:id', (req, res, next) => {
    const editId = req.params.id;
    res.end(editId);
})

app.get('/data', (req, res) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'synergicbbps@gmail.com',
            pass: 'Signature@123'
        }
    });

    var mailOptions = {
        from: 'synergicbbps@gmail.com',
        to: 'mondal.tanmoy@synergicsoftek.com',
        subject: 'ePoriseva',
        text: `
         Thank you for the bill payment of
         100000 against OTOE , Consumer No.
         12303037 ,Transaction ref ID IN011190000000150746 received on
         9/7/2021, 10:15:55 pm vide
         Cash.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        console.log('Email sent: ' + info.response);
    })
})

// Server Listening
app.listen(port, () => {
    console.log(`Server is Listning at PORT 3000`);
});