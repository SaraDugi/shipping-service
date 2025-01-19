const Shipment = require("../models/shipmentModel");

exports.getAllShipments = (req, res) => {
    Shipment.getAll((err, results) => {
      if (err) {
        return res.status(500).json({ message: "Failed to retrieve shipments" });
      }
      res.status(200).json(results);
    });
};