const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();
console.log(process.env.DB_HOST)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.PORT,   
});

module.exports = db;