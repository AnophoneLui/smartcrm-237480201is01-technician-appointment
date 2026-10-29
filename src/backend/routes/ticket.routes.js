const express = require("express");
const { AppError } = require("../errors");
const { createTicketService } = require("../services/ticket.service");
const service = createTicketService(require("../repositories/ticket.repository"));

const router = express.Router();

// Một định dạng lỗi cho toàn API: { error, message, fields? }
function handleError(res, error) {
  if (error instanceof AppError) {
    return res.status(error.status).json({ error: error.code, message: error.message, fields: error.fields });
  }
  if (error.code === "23505") return res.status(409).json({ error: "TRUNG_MA_PHIEU", message: "Mã phiếu đã tồn tại" });
  if (error.code === "23503") {
    return res.status(422).json({ error: "THAM_CHIEU_KHONG_TON_TAI", message: "Trung tâm hoặc nhóm sự cố không tồn tại" });
  }
  // Lỗi không lường trước: chi tiết kỹ thuật chỉ ghi log, người dùng chỉ thấy mã tra cứu
  const maTraCuu = Date.now().toString(36).toUpperCase();
  console.error(`[${maTraCuu}]`, error);
  return res.status(500).json({ error: "LOI_HE_THONG", message: "Hệ thống đang gặp sự cố. Vui lòng thử lại.", maTraCuu });
}

const wrap = (fn, status = 200) => (req, res) =>
  fn(req).then((data) => res.status(status).json({ data })).catch((e) => handleError(res, e));

router.get("/", wrap((req) => service.list(req.query)));
router.get("/:id", wrap((req) => service.get(req.params.id)));
router.get("/:id/suggestions", wrap((req) => service.suggest(req.params.id)));
router.patch("/:id/technician", wrap((req) => service.assign(req.params.id, req.body)));
router.get("/:id/appointments", wrap((req) => service.listAppointments(req.params.id)));
router.post("/:id/appointments", wrap((req) => service.createAppointment(req.params.id, req.body), 201));
router.put("/:id/appointments/current", wrap((req) => service.changeAppointment(req.params.id, req.body)));
router.delete("/:id/appointments/current", wrap((req) => service.cancelAppointment(req.params.id)));
router.post("/", wrap((req) => service.create(req.body), 201));
router.put("/:id", wrap((req) => service.update(req.params.id, req.body)));
router.delete("/:id", wrap((req) => service.remove(req.params.id)));

module.exports = router;
