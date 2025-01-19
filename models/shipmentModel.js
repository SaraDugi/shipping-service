const db = require('../db');

const Shipment = {
    getAll: (callback) => {
        const query = `SELECT * FROM shipments`;
        db.query(query, callback);
    },
};

module.exports = Shipment;