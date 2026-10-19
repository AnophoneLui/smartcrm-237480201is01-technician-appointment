const express = require("express");
const service = require("../services/ticket.service");

const router = express.Router();

function handleError(res, error) {
  const status = error.status || (error.code === "23505" ? 409 : error.code === "23503" ? 400 : 500);
  const message = error.code === "23505"
    ? "ticket_code đã tồn tại"
    : error.code === "23503"
      ? "center_id hoặc category_id không tồn tại"
      : error.message || "Lỗi máy chủ";
  return res.status(status).json({
    error: { message, details: error.details || undefined }
  });
}

router.get("/", async (req, res) => {
  try { res.json({ data: await service.list(req.query) }); }
  catch (error) { handleError(res, error); }
});

router.get("/:id", async (req, res) => {
  try { res.json({ data: await service.get(req.params.id) }); }
  catch (error) { handleError(res, error); }
});

router.post("/", async (req, res) => {
  try { res.status(201).json({ data: await service.create(req.body) }); }
  catch (error) { handleError(res, error); }
});

router.put("/:id", async (req, res) => {
  try { res.json({ data: await service.update(req.params.id, req.body) }); }
  catch (error) { handleError(res, error); }
});

router.delete("/:id", async (req, res) => {
  try { res.json({ data: await service.remove(req.params.id) }); }
  catch (error) { handleError(res, error); }
});

module.exports = router;
