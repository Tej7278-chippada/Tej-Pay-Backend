// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const dotenv = require("dotenv");
const PaymentRoutes = require("./routes/payments");
const AdminRoutes = require("./routes/adminRoutes");
const AuthRoutes = require('./routes/authRoutes');
const ValidationRazorPayRoutes = require('./routes/validationRazorPayRoutes');
const ValidationCashFreeRoutes = require('./routes/validationCashFreeRoutes');
const axios = require('axios');
const app = express();
app.use(cors());
app.use(express.json());
// const Razorpay = require("razorpay");
// dotenv.config();

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
//   });

// Connect MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define routes
app.use('/api/auth', AuthRoutes);
app.use('/api/payments', PaymentRoutes);
app.use('/api/adminPayments', AdminRoutes);
app.use('/api/validationRazorPayRoutes', ValidationRazorPayRoutes);
app.use('/api/validationCashFreeRoutes', ValidationCashFreeRoutes);

// // Cashfree API keys from .env
// const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
// const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

// // Cashfree Payout Base URL
// const CASHFREE_BASE_URL = "https://payout-api.cashfree.com/payout/v1";

// async function generateToken() {
//   try {
//     const response = await axios.post(
//       `${CASHFREE_BASE_URL}/authorize`,
//       {},
//       {
//         headers: {
//           "X-Client-Id": CASHFREE_CLIENT_ID,
//           "X-Client-Secret": CASHFREE_CLIENT_SECRET,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     console.log("Token generation response:", response.data);
//     return response.data.data.token;
//   } catch (error) {
//     console.error("Failed to generate token:", error.response?.data || error.message);
//     throw new Error("Failed to generate token");
//   }
// }

// app.post("/api/validate-upi", async (req, res) => {
//   const { upiId } = req.body;

//   if (!upiId) {
//     return res.status(400).json({ success: false, message: "UPI ID is required" });
//   }

//   try {
//     console.log("Verifying UPI ID:", upiId);

//     // Step 1: Generate Token
//     const token = await generateToken();

//     // Step 2: Call UPI Validation API
//     const validationResponse = await axios.get(
//       `${CASHFREE_BASE_URL}/validation/upiDetails`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         params: {
//           vpa: upiId,
//         },
//       }
//     );

//     const responseData = validationResponse.data;

//     if (responseData.status === "SUCCESSS" && responseData.data.accountExists === "YES") {
//       res.json({
//         success: true,
//         message: "UPI ID verified successfully",
//         data: responseData.data,
//       });
//     } else {
//       res.status(400).json({
//         success: false,
//         message: "Invalid UPI ID",
//         details: responseData,
//       });
//     }
//   } catch (error) {
//     console.error("UPI validation failed:", error.response?.data || error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to validate UPI ID",
//       details: error.response?.data || error.message,
//     });
//   }
// });

// // Bank Account Verification API
// app.post('/api/validate-bank', async (req, res) => {
//   const { accountNumber, ifscCode } = req.body;

//   if (!accountNumber || !ifscCode) {
//     return res.status(400).json({ error: "Account number and IFSC code are required" });
//   }

//   try {
//     const response = await axios.post(
//       'https://api.razorpay.com/v1/upi/verify',
//       { account_number: accountNumber, ifsc_code: ifscCode },
//       {
//         auth: {
//           username: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay API Key
//           password: process.env.RAZORPAY_KEY_SECRET, // Replace with your Razorpay API Secret
//         },
//       }
//     );

//     if (response.data && response.data.valid) {
//       return res.json({ success: true, message: "Bank account details are valid" });
//     } else {
//       return res.status(400).json({ error: "Bank verification failed" });
//     }
//   } catch (error) {
//     console.error('Bank verification failed:', error.response?.data || error.message);
//     return res.status(500).json({
//       error: 'Failed to validate bank details',
//       details: error.response?.data || error.message,
//     });
//   }
// });



// app.post('/api/validate-upi', async (req, res) => {
//   const { upiId } = req.body;

//   if (!upiId) {
//     return res.status(400).json({ success: false, error: "UPI ID is required" });
//   }

//   try {
//     const response = await axios.post(
//       'https://api.razorpay.com/v1/payments/validate/vpa',
//       { vpa: upiId },
//       {
//         auth: {
//           username: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay API Key
//           password: process.env.RAZORPAY_KEY_SECRET, // Replace with your Razorpay API Secret
//         },
//       }
//     );
//     console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
//     console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);
//     if (response.data && response.data.success) {
//       return res.status(200).json({ success: true, message: "UPI ID is valid" });
//     } else {
//       return res.status(400).json({ success: false, error: "Invalid UPI ID" });
//     }
//   } catch (error) {
//     console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
//     console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);
    
//     console.error('UPI validation failed:', error.response?.data || error.message);
//     res.status(500).json({ success: false, error: 'Failed to validate UPI ID',
//       details: error.response?.data || error.message, });
//   }
// });

const PORT = process.env.PORT || 5003;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port http://192.168.79.172:${PORT}`));
