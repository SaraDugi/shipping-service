const mysql = require('mysql2');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.PORT || 3306,
    ssl: {
        ca: fs.readFileSync('ca.pem'),
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = db.promise();