// use = util.promisify for async/await "npm i util.promisify"
const util = require('util');
const mysql = require('mysql');

/* 
* CONNECTION TO THE DATABSE
*/

const db = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'admin_eporiseva_bbps'
    //host: 'localhost',
    //user: 'test',
    //password: '8Dg1la0!',
    //database: 'admin_testing'
});

db.getConnection((err, connection) => {
    if (err)
        console.log('Something Went Wrong To Connect Database..');
    if (connection)
        connection.release();
    return;
});

db.query = util.promisify(db.query);

module.exports = db;