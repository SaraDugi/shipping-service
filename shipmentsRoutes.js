const express = require('express');
const router = express.Router();
const shipmentController = require('./shipmentController');
const { authenticateToken, authorizeRole } = require('./verifyToken');
const logRequest = require('./logRequest');

router.use(logRequest);
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
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
 *           description: Unique tracking number (optional)
 *         weight:
 *           type: number
 *           format: float
 *           description: Weight of the shipment in kg
 *         estimated_cost:
 *           type: number
 *           format: float
 *           description: Estimated cost of delivery
 * security:
 *   - BearerAuth: []
 */

/**
 * @swagger
 * /api/shipments:
 *   get:
 *     summary: Retrieve all shipments for the authenticated user
 *     tags: [Shipments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all shipments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shipment'
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Failed to retrieve shipments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve shipments
 */
router.get('/', authenticateToken, shipmentController.getAllShipments);
/**
 * @swagger
 * /api/shipments/{id}:
 *   get:
 *     summary: Retrieve a shipment by ID for the authenticated user
 *     tags: [Shipments]
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Shipment not found
 *       500:
 *         description: Failed to retrieve shipment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve shipment
 */
router.get('/:order_id', authenticateToken, shipmentController.getShipmentByOrderId);

/**
 * @swagger
 * /api/shipments:
 *   post:
 *     summary: Create a new shipment for the authenticated user
 *     tags: [Shipments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *                 description: Order ID associated with the shipment
 *                 example: ORD001
 *               recipient_name:
 *                 type: string
 *                 description: Name of the recipient
 *                 example: John Doe
 *               recipient_email:
 *                 type: string
 *                 description: Email of the recipient
 *                 example: johndoe@example.com
 *               recipient_phone:
 *                 type: string
 *                 description: Phone number of the recipient
 *                 example: 1234567890
 *               delivery_address:
 *                 type: string
 *                 description: Address for delivery
 *                 example: 123 Elm Street
 *               postal_number:
 *                 type: integer
 *                 description: Postal code of the delivery location
 *                 example: 12345
 *               city:
 *                 type: string
 *                 description: City of delivery
 *                 example: New York
 *               country:
 *                 type: string
 *                 description: Country of delivery
 *                 example: USA
 *               delivery_status:
 *                 type: string
 *                 enum:
 *                   - delivered
 *                   - in transit
 *                   - ready for pick up
 *                   - shipment handed over
 *                 description: Delivery status
 *                 example: in transit
 *               tracking_number:
 *                 type: string
 *                 description: Unique tracking number (optional)
 *                 example: TRACK001
 *                 nullable: true
 *               weight:
 *                 type: number
 *                 description: Weight of the shipment in kg
 *                 example: 1.5
 *               estimated_cost:
 *                 type: number
 *                 description: Estimated cost of delivery
 *                 example: 15.0
 *     responses:
 *       201:
 *         description: Shipment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: Shipment created successfully
 *                 shipmentId:
 *                   type: integer
 *                   description: ID of the created shipment
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields
 *       500:
 *         description: Failed to create shipment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to create shipment
 */
router.post('/', authenticateToken, shipmentController.createShipment);

/**
 * @swagger
 * /api/shipments/verify:
 *   post:
 *     summary: Verify if a shipment exists for a given order ID for the authenticated user
 *     description: This endpoint checks whether a shipment exists for the provided order ID. The authenticated user's JWT is required for authorization.
 *     tags: [Shipments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *             properties:
 *               order_id:
 *                 type: string
 *                 description: The order ID to check
 *                 example: ORD001
 *     responses:
 *       200:
 *         description: Verification result indicating whether the shipment exists for the provided order ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: Indicates whether the shipment exists.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Additional message about the result.
 *                   example: Shipment found for the provided order ID.
 *       400:
 *         description: Bad Request. This response is returned if the `order_id` field is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Explanation of the validation error.
 *                   example: "Order ID is required."
 *       401:
 *         description: Unauthorized. The user is not authorized to access this endpoint due to missing or invalid JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Explanation of the authorization failure.
 *                   example: "Unauthorized access. Please provide a valid token."
 *       404:
 *         description: Shipment not found for the provided order ID. This response indicates the shipment does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: Indicates that the shipment does not exist.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Explanation of the result.
 *                   example: Shipment not found for the provided order ID.
 *       500:
 *         description: Internal Server Error. This response indicates an unexpected error occurred while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message providing details about the failure.
 *                   example: "Failed to verify shipment."
 */
router.post('/verify', authenticateToken, shipmentController.verifyShipment);

/**
 * @swagger
 * /api/shipments/{id}/delivery-status:
 *   put:
 *     summary: Update the delivery status of a shipment for the authenticated user
 *     description: This endpoint allows authenticated users to update the delivery status of a shipment. A valid JWT token is required for authorization.
 *     tags: [Shipments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the shipment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - delivery_status
 *             properties:
 *               delivery_status:
 *                 type: string
 *                 enum:
 *                   - delivered
 *                   - in transit
 *                   - ready for pick up
 *                   - shipment handed over
 *                 description: The new delivery status to set for the shipment
 *                 example: delivered
 *     responses:
 *       200:
 *         description: Delivery status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: Delivery status updated successfully
 *       400:
 *         description: Bad Request. This response is returned if the `id` or `delivery_status` is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Explanation of the validation error
 *                   example: "Shipment ID and delivery_status are required."
 *       401:
 *         description: Unauthorized. The user is not authorized to access this endpoint due to missing or invalid JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Explanation of the authorization failure
 *                   example: "Unauthorized access. Please provide a valid token."
 *       404:
 *         description: Shipment not found. This response is returned if the shipment with the specified ID does not exist or does not belong to the authenticated user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Explanation of the result
 *                   example: Shipment not found.
 *       500:
 *         description: Internal Server Error. This response indicates an unexpected error occurred while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message providing details about the failure
 *                   example: "Failed to update delivery status."
 */
router.put('/:id/delivery-status', authenticateToken, shipmentController.updateDeliveryStatus);

/**
 * @swagger
 * /api/shipments/{id}/timestamp:
 *   put:
 *     summary: Update the timestamp of a shipment for the authenticated user
 *     tags: [Shipments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The shipment ID
 *     responses:
 *       200:
 *         description: Timestamp updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: Timestamp updated successfully
 *       400:
 *         description: Shipment ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Shipment ID is required
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Shipment not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to update timestamp
 */
router.put('/:id/timestamp', authenticateToken, shipmentController.updateTimestamp);

/**
 * @swagger
 * /api/shipments/{id}:
 *   delete:
 *     summary: Delete a shipment by ID for the authenticated user
 *     tags: [Shipments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the shipment to delete
 *     responses:
 *       200:
 *         description: Shipment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: Shipment deleted successfully
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Shipment not found
 *       500:
 *         description: Failed to delete shipment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to delete shipment
 */
router.delete('/:id', authenticateToken, shipmentController.deleteShipment);

/**
 * @swagger
 * /api/shipments:
 *   delete:
 *     summary: Delete all shipments for the authenticated user
 *     tags: [Shipments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All shipments deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: All shipments deleted successfully
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: No shipments to delete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No shipments to delete
 *       500:
 *         description: Failed to delete shipments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to delete shipments
 */
router.delete('/', authenticateToken, shipmentController.deleteAllShipments);
module.exports = router;