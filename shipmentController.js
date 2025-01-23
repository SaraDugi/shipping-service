const Shipment = require("./shipmentModel");
const jwt = require("jsonwebtoken");
const axios = require("axios"); // Add Axios to send requests to Stats Service

// Middleware to extract recipient_email from JWT
const getEmailFromToken = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new Error("Authorization token is required");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.name; // Extract email from the token
};

// Function to log stats to Stats Service
const logStat = async (endpoint) => {
  try {
    await axios.post("http://localhost:28765/stats", { endpoint });
  } catch (error) {
    console.error("Failed to log stat:", error.message);
  }
};

exports.getAllShipments = async (req, res) => {
  try {
    const recipient_email = getEmailFromToken(req);
    const shipments = await Shipment.getAll(recipient_email);

    // Log the stat
    await logStat("/api/shipments");

    res.status(200).json(shipments);
  } catch (error) {
    console.error("Error fetching shipments:", error.message);
    res.status(500).json({ message: "Failed to retrieve shipments" });
  }
};

exports.getShipmentByOrderId = async (req, res) => {
  const { order_id } = req.params; // Extract order_id from params

  if (!order_id) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    // Extract recipient email from the JWT token
    const recipient_email = getEmailFromToken(req);

    // Fetch the shipment using order_id and recipient email
    const shipment = await Shipment.getByOrderId(order_id, recipient_email);

    // Check if the shipment exists
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // Log the stat for tracking API usage
    await logStat(`/api/shipments/${order_id}`);

    // Respond with the shipment details
    res.status(200).json(shipment);
  } catch (error) {
    console.error("Error fetching shipment by Order ID:", error.message);
    res.status(500).json({ message: "Failed to retrieve shipment" });
  }
};


exports.verifyShipment = async (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    const recipient_email = getEmailFromToken(req);
    const exists = await Shipment.exists(order_id, recipient_email);

    // Log the stat
    await logStat("/api/shipments/verify");

    res.status(200).json({ exists });
  } catch (error) {
    console.error("Error verifying shipment:", error.message);
    res.status(500).json({ message: "Failed to verify shipment" });
  }
};

exports.createShipment = async (req, res) => {
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
    tracking_number = null,
    weight,
    estimated_cost,
    created_at = new Date(),
    updated_at = new Date(),
  } = req.body;

  if (
    !order_id ||
    !recipient_name ||
    !recipient_email ||
    !recipient_phone ||
    !delivery_address ||
    !postal_number ||
    !city ||
    !country ||
    !delivery_status ||
    !weight ||
    !estimated_cost
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const shipmentData = {
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
      estimated_cost,
      created_at,
      updated_at,
    };

    const shipmentId = await Shipment.create(shipmentData);

    // Log the stat
    await logStat("/api/shipments");

    res.status(201).json({ message: "Shipment created successfully", shipmentId });
  } catch (error) {
    console.error("Error creating shipment:", error.message);
    res.status(500).json({ message: "Failed to create shipment" });
  }
};

exports.updateTimestamp = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Shipment ID is required" });
  }

  try {
    const recipient_email = getEmailFromToken(req);
    const rowsAffected = await Shipment.updateTimestamp(id, recipient_email);

    if (rowsAffected === 0) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // Log the stat
    await logStat(`/api/shipments/${id}/timestamp`);

    res.status(200).json({ message: "Timestamp updated successfully" });
  } catch (error) {
    console.error("Error updating timestamp:", error.message);
    res.status(500).json({ message: "Failed to update timestamp" });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  const { id } = req.params;
  const { delivery_status } = req.body;

  if (!id || !delivery_status) {
    return res.status(400).json({ message: "Shipment ID and delivery_status are required" });
  }

  try {
    const recipient_email = getEmailFromToken(req);
    const rowsAffected = await Shipment.updateDeliveryStatus(id, recipient_email, delivery_status);

    if (rowsAffected === 0) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // Log the stat
    await logStat(`/api/shipments/${id}/delivery-status`);

    res.status(200).json({ message: "Delivery status updated successfully" });
  } catch (error) {
    console.error("Error updating delivery status:", error.message);
    res.status(500).json({ message: "Failed to update delivery status" });
  }
};

exports.deleteShipment = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Shipment ID is required" });
  }

  try {
    const recipient_email = getEmailFromToken(req);
    const rowsAffected = await Shipment.delete(id, recipient_email);

    if (rowsAffected === 0) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // Log the stat
    await logStat(`/api/shipments/${id}`);

    res.status(200).json({ message: "Shipment deleted successfully" });
  } catch (error) {
    console.error("Error deleting shipment:", error.message);
    res.status(500).json({ message: "Failed to delete shipment" });
  }
};

exports.deleteAllShipments = async (req, res) => {
  try {
    const recipient_email = getEmailFromToken(req);
    const rowsAffected = await Shipment.deleteAll(recipient_email);

    if (rowsAffected === 0) {
      return res.status(404).json({ message: "No shipments to delete" });
    }

    // Log the stat
    await logStat("/api/shipments");

    res.status(200).json({ message: "All shipments deleted successfully" });
  } catch (error) {
    console.error("Error deleting all shipments:", error.message);
    res.status(500).json({ message: "Failed to delete shipments" });
  }
};