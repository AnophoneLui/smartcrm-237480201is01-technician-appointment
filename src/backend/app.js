const path = require("path");
const express = require("express");
const cors = require("cors");
const ticketRoutes = require("./routes/ticket.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "smartcrm-ticket-api" }));
app.use("/api/tickets", ticketRoutes);

// API không có đường dẫn -> 404 cùng định dạng lỗi
app.use("/api", (req, res) =>
  res.status(404).json({ error: "KHONG_TIM_THAY_DUONG_DAN", message: `Không tìm thấy đường dẫn ${req.originalUrl}` }));

// Giao diện (Vue chạy trực tiếp trên trình duyệt) phục vụ cùng cổng với API
app.use(express.static(path.join(__dirname, "..", "frontend")));

// JSON gửi lên bị hỏng -> 400, không để rơi thành 500
app.use((err, _req, res, _next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON_KHONG_HOP_LE", message: "Nội dung gửi lên không phải JSON hợp lệ" });
  }
  console.error(err);
  return res.status(500).json({ error: "LOI_HE_THONG", message: "Hệ thống đang gặp sự cố. Vui lòng thử lại." });
});

module.exports = app;
