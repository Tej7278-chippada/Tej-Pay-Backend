// routes/payments.js
const express = require("express");
// const { authMiddleware } = require("../middleware/auth");
const Payment = require("../models/Payment");
// const User = require("../models/userModel");
const Razorpay = require("razorpay");
const router = express.Router();

const dotenv = require("dotenv");
dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });




// Payment History Route: Fetch all payment records stored on TejPay database.
router.get("/payments-history", async (req, res) => {
    try {
    const payments = await Payment.find().sort({ created_at: -1 }); // Sort by newest first
    res.json(payments);
    } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ error: "Failed to fetch payment history" });
    }
});

// Fetch Payment History from RazorPay database
router.get("/razorpay-history", async (req, res) => {
    try {
      let allPayments = [];
      let options = { count: 100, skip: 0 }; // Fetch up to 100 records per call
      let response;
  
      do {
        response = await razorpay.payments.all(options);
        allPayments = allPayments.concat(response.items);
        options.skip += response.count; // Increment the skip value for the next batch
      } while (response.items.length > 0);
  
      res.json(allPayments);
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });

module.exports = router;