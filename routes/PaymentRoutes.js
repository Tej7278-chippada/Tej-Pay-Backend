// routes/PaymentRoutes.js
// const Payment = require("./models/Payment"); // Import Payment model
const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const express = require('express');
const Payment = require("../models/Payment");
const router = express.Router();

dotenv.config();


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Payment Route
router.post("/", async (req, res) => {
  const { amount } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    });

    // Save the order details to MongoDB
    const Payment = new Payment({
      razorpay_order_id: order.id,
      amount: order.amount / 100, // Convert paise to rupees
      currency: order.currency,
      status: "created",
      created_at: new Date(),
    });
    await payment.save();

    res.json(order);
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

// Payment History Route
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ created_at: -1 });
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
});

// Fetch Single Payment Details from Razorpay API
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    const razorpayPayment = await razorpay.payments.fetch(payment.razorpay_payment_id);
    res.json({ payment, razorpayPayment });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
});

module.exports = router;
