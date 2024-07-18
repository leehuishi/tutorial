const mysql = require('mysql2');
const dotenv = require('dotenv');

//setting up config.env file variables
dotenv.config({path: './config.env'});

const dbconnection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_DB
});

module.exports = dbconnection;