const mysql = require('mysql');

// const dbconnection = mysql.createConnection({
//     host:"localhost",
//     user: "root",
//     password: "password",
//     database: "taskmanagement"
// });


const dbconnection = mysql.createPool({
    host:"localhost",
    user: "root",
    password: "password",
    database: "taskmanagement"
});

module.exports = dbconnection;