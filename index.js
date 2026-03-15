require("dotenv").config();

const express = require("express");
const twilioWebhook = require("./routes/twilioWebhook");

const app = express();

// Twilio sends webhooks as application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Health-check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Twilio webhook endpoint
app.use("/webhook", twilioWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀  Callflow server listening on port ${PORT}`);
});
