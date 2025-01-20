// routes/payments.js
const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const Payment = require("../models/Payment");
const User = require("../models/userModel");
const Razorpay = require("razorpay");
const router = express.Router();

const dotenv = require("dotenv");
dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

// Create Payment
router.post("/", authMiddleware, async (req, res) => {
    const { amount, contact, email, payment_method } = req.body; // Include contact and email in the request
    const userId = req.user.id;
    try {
      const order = await razorpay.orders.create({
        amount: amount * 100, // Amount in paise
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
      });
  
      // Save order details to MongoDB
      const payment = new Payment({
        razorpay_order_id: order.id,
        amount: order.amount / 100, // Convert paise to rupees
        currency: order.currency,
        status: "created",
        created_at: new Date(),
        contact : contact || "N/A",
        email : email || "N/A",
        payment_method : payment_method || "N/A",
      });
      await payment.save();
  
      // Reflect order in user and seller data
      const user = await User.findById(userId);
      user.payments.push(payment._id); // Assuming 'payments' is an array
      await user.save();
  
  
      res.json(order);
    } catch (error) {
      console.error("Razorpay order creation failed:", error);
      res.status(500).json({ error: "Failed to create Razorpay order" });
    }
});

// Update Payment
router.post("/update", async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, status,
    contact,
    email,
    payment_method, } = req.body;

    try {
    // Verify payment signature (optional but recommended for security)
    const crypto = require("crypto");
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (razorpay_signature !== expectedSignature) {
        return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Update the payment status in the database
    const updatedPayment = await Payment.findOneAndUpdate(
        { razorpay_order_id },
        {
        razorpay_payment_id,
        status: "captured",
        contact : contact || "N/A",
        email : email || "N/A",
        payment_method : payment_method || "N/A",
        updated_at: new Date(),
        },
        { new: true }
    );

    if (!updatedPayment) {
        return res.status(404).json({ error: "Order not found" });
    }

    res.json(updatedPayment);
    } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ error: "Failed to update payment" });
    }
});

router.get("/:orderId", async (req, res) => {
    const { orderId } = req.params;
  
    try {
      // Fetch the order details from Razorpay
      const orderDetails = await razorpay.orders.fetch(orderId);
  
      if (!orderDetails) {
        return res.status(404).json({ error: "Order details not found" });
      }
  
      // Fetch the payment details for the order
      const paymentDetails = await razorpay.orders.fetchPayments(orderId);
  
      const latestPayment = paymentDetails.items[0]; // Assuming you want the most recent payment
  
      res.json({
        orderDetails,
        paymentDetails: latestPayment || {},
      });
    } catch (error) {
      console.error("Error fetching payment details:", error);
      res.status(500).json({ error: "Failed to fetch payment details" });
    }
});

// Payment History Route: Fetch all payment records.
router.get("/", async (req, res) => {
    try {
    const payments = await Payment.find().sort({ created_at: -1 }); // Sort by newest first
    res.json(payments);
    } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ error: "Failed to fetch payment history" });
    }
});

// Fetch Single Payment Details from Razorpay API
router.get("/details/:id", async (req, res) => {
    const { id } = req.params;
    try {
    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    const razorpayPayment = await razorpay.payments.fetch(payment.razorpay_order_id);
    res.json({ payment, razorpayPayment });
    } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ error: "Failed to fetch payment details" });
    }
});

// Fetch Payment by Razorpay ID
router.get("/payment-details/:paymentId", async (req, res) => {
    const { paymentId } = req.params;
    try {
      const paymentDetails = await razorpay.payments.fetch(paymentId);
      res.json(paymentDetails);
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
      res.status(500).json({ error: "Failed to fetch payment details" });
    }
});
  
// Fetch Payment History from Razorpay
// router.get("/payments-history", async (req, res) => {
//     try {
//         let allPayments = [];
//         let options = { count: 100, skip: 0 };
//         let response;

//         do {
//         response = await razorpay.payments.all(options);
//         allPayments = allPayments.concat(response.items);
//         options.skip += response.count;
//         } while (response.items.length > 0);

//         res.json(allPayments);
//     } catch (error) {
//         console.error("Failed to fetch payment history:", error);
//         res.status(500).json({ error: "Failed to fetch payment history" });
//     }
// });
  

module.exports = router;