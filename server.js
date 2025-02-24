require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const ownerRoutes = require("./routes/ownerRoutes")

const app = express();
const PORT = process.env.PORT || 5000;

// Check if running in production or development
const isProduction = process.env.NODE_ENV === "production";

// Set allowed origins dynamically
const allowedOrigins = isProduction
  ? [process.env.FRONTEND_URL_PROD] // Use production frontend URL
  : ["http://localhost:3000"]; // Use localhost for development

  app.use(
    cors({
      origin: allowedOrigins, // Allowed origins (ensure it's an array)
      credentials: true, // Allow cookies, authentication headers, etc.
    })
  );  

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });  

app.use(express.json());

// Add this line to serve the uploads directory
app.use('/uploads', express.static('uploads'));

// Dynamic API Route
app.use("/rental", userRoutes);
app.use("/rental", ownerRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${isProduction ? "PRODUCTION" : "DEVELOPMENT"} mode on port ${PORT}`);
});
