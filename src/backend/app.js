const express = require("express");
const cors = require("cors");
const ticketRoutes = require("./routes/ticket.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "smartcrm-ticket-api" });
});

app.use("/api/tickets", ticketRoutes);

app.use((req, res) => {
  res.status(404).json({ error: { message: `Không tìm thấy đường dẫn ${req.path}` } });
});

module.exports = app;
