// routes/validationCashFreeRoutes.js
const express = require("express");
// const { authMiddleware } = require("../middleware/auth");
const Payment = require("../models/Payment");
// const User = require("../models/userModel");
// const Razorpay = require("razorpay");
const router = express.Router();
const axios = require('axios');
const dotenv = require("dotenv");
dotenv.config();

// Cashfree API keys from .env
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

// Cashfree Payout Base URL
const CASHFREE_BASE_URL = "https://payout-api.cashfree.com/payout/v1";

async function generateToken() {
  try {
    const response = await axios.post(
      `${CASHFREE_BASE_URL}/authorize`,
      {},
      {
        headers: {
          "X-Client-Id": CASHFREE_CLIENT_ID,
          "X-Client-Secret": CASHFREE_CLIENT_SECRET,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Token generation response:", response.data);
    return response.data.data.token;
  } catch (error) {
    console.error("Failed to generate token:", error.response?.data || error.message);
    throw new Error("Failed to generate token");
  }
}

router.post("/validate-upi", async (req, res) => {
  const { upiId } = req.body;

  if (!upiId) {
    return res.status(400).json({ success: false, message: "UPI ID is required" });
  }

  try {
    console.log("Verifying UPI ID:", upiId);

    // Step 1: Generate Token
    const token = await generateToken();

    // Step 2: Call UPI Validation API
    const validationResponse = await axios.get(
      `${CASHFREE_BASE_URL}/validation/upiDetails`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          vpa: upiId,
        },
      }
    );

    const responseData = validationResponse.data;

    if (responseData.status === "SUCCESSS" && responseData.data.accountExists === "YES") {
      res.json({
        success: true,
        message: "UPI ID verified successfully",
        data: responseData.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid UPI ID",
        details: responseData,
      });
    }
  } catch (error) {
    console.error("UPI validation failed:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to validate UPI ID",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;