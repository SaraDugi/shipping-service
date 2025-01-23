const db = require('./db');

const logRequest = async (req, res, next) => {
    try {
        const { method, originalUrl } = req;

        await db.query(
            'INSERT INTO command_log (method, endpoint) VALUES (?, ?)',
            [method, originalUrl]
        );
    } catch (error) {
        console.error('Error logging request:', error.message);
    }
    next();
};

module.exports = logRequest;
