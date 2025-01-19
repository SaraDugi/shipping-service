const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const shipmentsRoutes = require('./routes/shipmentsRoutes');
const db = require('./db'); // Import the database connection

// Load environment variables
dotenv.config();

const app = express();

// Middleware for CORS
app.use(cors({
    origin: (origin, callback) => {
        const whitelist = ['http://localhost:28763', 'http://localhost:3000'];
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json()); // Parse JSON requests

// Handle preflight OPTIONS requests
app.options('*', cors());

// Test database connection on startup
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Shipment API',
            version: '1.0.0',
            description: 'API for managing shipments',
        },
        servers: [
            {
                url: 'http://localhost:28763/api', // Ensure this matches your server URL
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to route files for Swagger
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/shipments', shipmentsRoutes);

// Health check route
app.get('/api/health', async (req, res) => {
    try {
        const [result] = await db.promise().query('SELECT 1');
        res.status(200).json({ status: 'UP', message: 'Service is healthy' });
    } catch (error) {
        console.error('Health check failed:', error.message);
        res.status(500).json({ status: 'DOWN', error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 28763;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger documentation is available at http://localhost:${PORT}/api-docs`);
});
