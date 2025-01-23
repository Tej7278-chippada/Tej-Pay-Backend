// routes/validationRazorPayRoutes.js
const express = require("express");
// const { authMiddleware } = require("../middleware/auth");
const Payment = require("../models/Payment");
// const User = require("../models/userModel");
// const Razorpay = require("razorpay");
const router = express.Router();
const axios = require('axios');
const dotenv = require("dotenv");
dotenv.config();

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
//   });

// Bank Account Verification API
router.post('/validate-bank', async (req, res) => {
  const { accountNumber, ifscCode } = req.body;

  if (!accountNumber || !ifscCode) {
    return res.status(400).json({ error: "Account number and IFSC code are required" });
  }

  try {
    const response = await axios.post(
      'https://api.razorpay.com/v1/upi/verify',
      { account_number: accountNumber, ifsc_code: ifscCode },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay API Key
          password: process.env.RAZORPAY_KEY_SECRET, // Replace with your Razorpay API Secret
        },
      }
    );

    if (response.data && response.data.valid) {
      return res.json({ success: true, message: "Bank account details are valid" });
    } else {
      return res.status(400).json({ error: "Bank verification failed" });
    }
  } catch (error) {
    console.error('Bank verification failed:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to validate bank details',
      details: error.response?.data || error.message,
    });
  }
});


// UPI validation route
router.post('/validate-upi', async (req, res) => {
  const { upiId } = req.body;

  if (!upiId) {
    return res.status(400).json({ success: false, error: "UPI ID is required" });
  }

  try {
    const response = await axios.post(
      'https://api.razorpay.com/v1/payments/validate/vpa',
      { vpa: upiId },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay API Key
          password: process.env.RAZORPAY_KEY_SECRET, // Replace with your Razorpay API Secret
        },
      }
    );
    console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
    console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);
    if (response.data && response.data.success) {
      return res.status(200).json({ success: true, message: "UPI ID is valid" });
    } else {
      return res.status(400).json({ success: false, error: "Invalid UPI ID" });
    }
  } catch (error) {
    console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
    console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);
    
    console.error('UPI validation failed:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Failed to validate UPI ID',
      details: error.response?.data || error.message, });
  }
});




module.exports = router;