const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const shipmentsRoutes = require('./shipmentsRoutes');
const db = require('./db');
const axios = require('axios');
const app = express();
const PORT = 9000;

dotenv.config();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Shipment Service API',
            version: '1.0.0',
            description: 'API for managing shipments (REST and GraphQL)',
        },
        servers: [{ url: `http://localhost:${PORT}` }],
        components: {
            schemas: {
                Statistics: {
                    type: 'object',
                    properties: {
                        total_shipments: { type: 'integer', description: 'Total number of shipments' },
                        delivered_shipments: { type: 'integer', description: 'Number of delivered shipments' },
                        in_transit_shipments: { type: 'integer', description: 'Number of shipments in transit' },
                        ready_for_pickup: { type: 'integer', description: 'Number of shipments ready for pickup' },
                        top_countries: {
                            type: 'object',
                            additionalProperties: { type: 'integer' },
                            description: 'Top countries with their shipment counts',
                        },
                    },
                },
            },
        },
    },
    apis: ['./*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// GraphQL Schema
const schema = buildSchema(`
    type Address {
        delivery_address: String!
        postal_number: Int!
        city: String!
        country: String!
    }

    type Recipient {
        name: String!
        email: String!
        phone: String!
    }

    type Shipment {
        id: Int!
        order_id: String!
        recipient: Recipient!
        address: Address!
        delivery_status: String!
        weight: Float!
        estimated_cost: Float!
    }

    type Statistics {
        total_shipments: Int!
        delivered_shipments: Int!
        in_transit_shipments: Int!
        ready_for_pickup: Int!
        top_countries: [String!]
    }

    type Query {
        shipments: [Shipment]
        shipmentById(id: Int!): Shipment
        statistics: Statistics
        shipmentsByCountry(country: String!): [Shipment]
        totalShipments: Int!
    }
`);

// GraphQL Resolvers
const root = {
    shipments: async () => {
        try {
            const [rows] = await db.query('SELECT * FROM shipments');
            return rows.map(row => ({
                ...row,
                recipient: {
                    name: row.recipient_name,
                    email: row.recipient_email,
                    phone: row.recipient_phone,
                },
                address: {
                    delivery_address: row.delivery_address,
                    postal_number: row.postal_number,
                    city: row.city,
                    country: row.country,
                },
            }));
        } catch (error) {
            console.error('Error fetching shipments:', error.message);
            throw new Error('Failed to fetch shipments');
        }
    },
    shipmentById: async ({ id }) => {
        try {
            const [rows] = await db.query('SELECT * FROM shipments WHERE id = ?', [id]);
            if (rows.length === 0) {
                throw new Error('Shipment not found');
            }
            const row = rows[0];
            return {
                ...row,
                recipient: {
                    name: row.recipient_name,
                    email: row.recipient_email,
                    phone: row.recipient_phone,
                },
                address: {
                    delivery_address: row.delivery_address,
                    postal_number: row.postal_number,
                    city: row.city,
                    country: row.country,
                },
            };
        } catch (error) {
            console.error('Error fetching shipment by ID:', error.message);
            throw new Error('Failed to fetch shipment');
        }
    },
};

// GraphQL Middleware
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true, // Enable GraphiQL interface for testing
}));

// REST API Routes
app.use('/api/shipments', shipmentsRoutes);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check the health of the service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: UP
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 */
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Service is healthy' });
});

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Fetch shipment statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Shipment statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Statistics'
 *       500:
 *         description: Failed to fetch statistics from sub-service
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch statistics from sub-service
 */
app.get('/api/statistics', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:9200/statistics');
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching statistics:', error.message);
        res.status(500).json({ message: 'Failed to fetch statistics from sub-service' });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`GraphQL API is available at http://localhost:${PORT}/graphql`);
    console.log(`Swagger documentation is available at http://localhost:${PORT}/api-docs`);
});