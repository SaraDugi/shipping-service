const db = require('./db');

const Shipment = {
    getAll: async (recipient_email) => {
        try {
            const [rows] = await db.query('SELECT * FROM shipments WHERE recipient_email = ?', [recipient_email]);
            return rows;
        } catch (error) {
            console.error('Error fetching shipments:', error.message);
            throw new Error('Database error');
        }
    },

    getByOrderId: async (order_id, recipient_email) => {
        try {
          const [rows] = await db.query(
            'SELECT * FROM shipments WHERE order_id = ? AND recipient_email = ?',
            [order_id, recipient_email]
          );
          return rows[0];
        } catch (error) {
          console.error('Error fetching shipment by Order ID:', error.message);
          throw new Error('Database error');
        }
      },      

    create: async (shipmentData) => {
        try {
            const [result] = await db.query('INSERT INTO shipments SET ?', shipmentData);
            return result.insertId;
        } catch (error) {
            console.error('Error creating shipment:', error.message);
            throw new Error('Database error');
        }
    },

    exists: async (order_id, recipient_email) => {
        try {
            const [rows] = await db.query(
                'SELECT COUNT(*) as count FROM shipments WHERE order_id = ? AND recipient_email = ?',
                [order_id, recipient_email]
            );
            return rows[0].count > 0;
        } catch (error) {
            console.error('Error checking shipment existence:', error.message);
            throw new Error('Database error');
        }
    },

    updateDeliveryStatus: async (id, recipient_email, delivery_status) => {
        try {
            const [result] = await db.query(
                'UPDATE shipments SET delivery_status = ? WHERE id = ? AND recipient_email = ?',
                [delivery_status, id, recipient_email]
            );
            return result.affectedRows;
        } catch (error) {
            console.error('Error updating delivery status:', error.message);
            throw new Error('Database error');
        }
    },

    updateTimestamp: async (id, recipient_email) => {
        try {
            const [result] = await db.query(
                'UPDATE shipments SET updated_at = ? WHERE id = ? AND recipient_email = ?',
                [new Date(), id, recipient_email]
            );
            return result.affectedRows;
        } catch (error) {
            console.error('Error updating timestamp:', error.message);
            throw new Error('Database error');
        }
    },

    delete: async (id, recipient_email) => {
        try {
            const [result] = await db.query(
                'DELETE FROM shipments WHERE id = ? AND recipient_email = ?',
                [id, recipient_email]
            );
            return result.affectedRows;
        } catch (error) {
            console.error('Error deleting shipment:', error.message);
            throw new Error('Database error');
        }
    },

    deleteAll: async (recipient_email) => {
        try {
            const [result] = await db.query('DELETE FROM shipments WHERE recipient_email = ?', [recipient_email]);
            return result.affectedRows;
        } catch (error) {
            console.error('Error deleting all shipments:', error.message);
            throw new Error('Database error');
        }
    },
};

module.exports = Shipment;