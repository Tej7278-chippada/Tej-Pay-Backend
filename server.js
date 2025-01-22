// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const dotenv = require("dotenv");
const PaymentRoutes = require("./routes/payments");
const AdminRoutes = require("./routes/adminRoutes");
const authRoutes = require('./routes/authRoutes');

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

// Fetch Payment History
// app.get("/api/payments-history", async (req, res) => {
//   try {
//     let allPayments = [];
//     let options = { count: 100, skip: 0 }; // Fetch up to 100 records per call
//     let response;

//     do {
//       response = await razorpay.payments.all(options);
//       allPayments = allPayments.concat(response.items);
//       options.skip += response.count; // Increment the skip value for the next batch
//     } while (response.items.length > 0);

//     res.json(allPayments);
//   } catch (error) {
//     console.error("Failed to fetch payment history:", error);
//     res.status(500).json({ error: "Failed to fetch payment history" });
//   }
// });


// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', PaymentRoutes);
app.use('/api/adminPayments', AdminRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port http://192.168.79.172:${PORT}`));
