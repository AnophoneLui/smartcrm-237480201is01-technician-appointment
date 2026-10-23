// ============================================================================
// HỢP ĐỒNG DỮ LIỆU — ranh giới: lớp nghiệp vụ (service) -> lớp trình bày (API/giao diện)
// Lớp trình bày KHÔNG bao giờ biết tên cột bảng; đổi tên cột chỉ sửa file này.
//
// PHIẾU (toTicketView)
//   ticketId    : số nguyên, luôn có (CSDL trả BIGINT dạng chuỗi -> ép về số tại đây)
//   ticketCode  : chuỗi, luôn có
//   centerId    : số nguyên, luôn có
//   tenNhomSuCo : chuỗi HOẶC null nếu thiếu thông tin nhóm sự cố
//   uuTien      : LOW | MEDIUM | HIGH | URGENT
//   trangThai   : NEW | ASSIGNED | IN_PROGRESS | WAITING | COMPLETED | CLOSED
//   hanCamKet   : chuỗi ISO 8601 (UTC, đuôi Z), luôn có
//   kyThuatVien : { id, hoTen } HOẶC null nếu CHƯA phân công
// KHI SAI: không tìm thấy phiếu -> service ném AppError 404 (API trả 404).
//
// GỢI Ý KTV (toSuggestionView)
//   id, hoTen, tayNghe (1..5), soPhieuDangXuLy (số nguyên >= 0)
//
// LỊCH HẸN (toAppointmentView)
//   appointmentId, ticketId, kyThuatVienId : số nguyên; gioHen : ISO 8601 (UTC)
// ============================================================================

function toTicketView(row) {
  return {
    ticketId: Number(row.ticket_id),
    ticketCode: row.ticket_code,
    centerId: Number(row.center_id),
    tenNhomSuCo: row.category_name ?? null,
    uuTien: row.priority,
    trangThai: row.status,
    hanCamKet: new Date(row.due_date).toISOString(),
    kyThuatVien:
      row.technician_id == null
        ? null
        : { id: Number(row.technician_id), hoTen: row.technician_name ?? `KTV #${row.technician_id}` },
  };
}

function toSuggestionView(row) {
  return {
    id: Number(row.technician_id),
    hoTen: row.full_name ?? `KTV #${row.technician_id}`,
    tayNghe: Number(row.proficiency),
    soPhieuDangXuLy: Number(row.open_count),
  };
}

function toAppointmentView(row) {
  return {
    appointmentId: Number(row.appointment_id),
    ticketId: Number(row.ticket_id),
    kyThuatVienId: Number(row.technician_id),
    gioHen: new Date(row.gio_hen_iso ?? row.scheduled_at).toISOString(),
  };
}

module.exports = { toTicketView, toSuggestionView, toAppointmentView };
