const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @swagger
 * components:
 *   schemas:
 *     Shipment:
 *       type: object
 *       required:
 *         - order_id
 *         - recipient_name
 *         - recipient_email
 *         - recipient_phone
 *         - delivery_address
 *         - postal_number
 *         - city
 *         - country
 *         - delivery_status
 *         - tracking_number
 *         - weight
 *         - estimated_cost
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         order_id:
 *           type: string
 *           description: Order ID associated with the shipment
 *         recipient_name:
 *           type: string
 *           description: Name of the recipient
 *         recipient_email:
 *           type: string
 *           description: Email of the recipient
 *         recipient_phone:
 *           type: string
 *           description: Phone number of the recipient
 *         delivery_address:
 *           type: string
 *           description: Address for delivery
 *         postal_number:
 *           type: integer
 *           description: Postal code of the delivery location
 *         city:
 *           type: string
 *           description: City of delivery
 *         country:
 *           type: string
 *           description: Country of delivery
 *         delivery_status:
 *           type: string
 *           enum:
 *             - delivered
 *             - in transit
 *             - ready for pick up
 *             - shipment handed over
 *           description: Delivery status
 *         tracking_number:
 *           type: string
 *           description: Unique tracking number
 *         weight:
 *           type: float
 *           description: Weight of the shipment in kg
 *         estimated_cost:
 *           type: float
 *           description: Estimated cost of delivery
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /api/shipments:
 *   get:
 *     summary: Retrieve all shipments
 *     tags: [Shipments]
 *     responses:
 *       200:
 *         description: List of all shipments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shipment'
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM shipments');
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch shipments' });
    }
});

/**
 * @swagger
 * /api/shipments/{id}:
 *   get:
 *     summary: Retrieve a shipment by ID
 *     tags: [Shipments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The shipment ID
 *     responses:
 *       200:
 *         description: Shipment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shipment'
 *       404:
 *         description: Shipment not found
 */
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM shipments WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Shipment not found' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch shipment' });
    }
});

/**
 * @swagger
 * /api/shipments:
 *   post:
 *     summary: Create a new shipment
 *     tags: [Shipments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shipment'
 *     responses:
 *       201:
 *         description: Shipment created successfully
 */
router.post('/', async (req, res) => {
    const {
        order_id,
        recipient_name,
        recipient_email,
        recipient_phone,
        delivery_address,
        postal_number,
        city,
        country,
        delivery_status,
        tracking_number,
        weight,
        estimated_cost
    } = req.body;

    if (!order_id || !recipient_name || !recipient_email || !recipient_phone || !delivery_address || !postal_number ||
        !city || !country || !delivery_status || !tracking_number || !weight || !estimated_cost) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await db.promise().query(
            `INSERT INTO shipments (
                order_id, recipient_name, recipient_email, recipient_phone,
                delivery_address, postal_number, city, country, delivery_status,
                tracking_number, weight, estimated_cost
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [order_id, recipient_name, recipient_email, recipient_phone, delivery_address, postal_number, city, country,
                delivery_status, tracking_number, weight, estimated_cost]
        );
        res.status(201).json({ message: 'Shipment created', shipmentId: result[0].insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create shipment' });
    }
});

/**
 * @swagger
 * /api/shipments/{id}:
 *   put:
 *     summary: Update a shipment by ID
 *     tags: [Shipments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The shipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shipment'
 *     responses:
 *       200:
 *         description: Shipment updated successfully
 *       404:
 *         description: Shipment not found
 */
router.put('/:id', async (req, res) => {
    const {
        order_id,
        recipient_name,
        recipient_email,
        recipient_phone,
        delivery_address,
        postal_number,
        city,
        country,
        delivery_status,
        tracking_number,
        weight,
        estimated_cost
    } = req.body;

    try {
        const [result] = await db.promise().query(
            `UPDATE shipments SET
                order_id = ?, recipient_name = ?, recipient_email = ?, recipient_phone = ?,
                delivery_address = ?, postal_number = ?, city = ?, country = ?, delivery_status = ?,
                tracking_number = ?, weight = ?, estimated_cost = ?
            WHERE id = ?`,
            [order_id, recipient_name, recipient_email, recipient_phone, delivery_address, postal_number, city, country,
                delivery_status, tracking_number, weight, estimated_cost, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Shipment not found' });
        }
        res.status(200).json({ message: 'Shipment updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update shipment' });
    }
});

/**
 * @swagger
 * /api/shipments/{id}:
 *   delete:
 *     summary: Delete a shipment by ID
 *     tags: [Shipments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The shipment ID
 *     responses:
 *       200:
 *         description: Shipment deleted successfully
 *       404:
 *         description: Shipment not found
 */
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.promise().query('DELETE FROM shipments WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Shipment not found' });
        }
        res.status(200).json({ message: 'Shipment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete shipment' });
    }
});

module.exports = router;