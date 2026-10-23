export const TRANG_THAI = { NEW: "Mới", ASSIGNED: "Đã phân công", IN_PROGRESS: "Đang xử lý", WAITING: "Chờ linh kiện", COMPLETED: "Hoàn tất", CLOSED: "Đã đóng" };
export const UU_TIEN = { LOW: "Thấp", MEDIUM: "Trung bình", HIGH: "Cao", URGENT: "Khẩn" };
export const fmtNgayGio = (iso) => new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

// Ngữ cảnh cho con số: hạn cam kết so với hiện tại
export function conHan(iso, now = Date.now()) {
  const gio = (new Date(iso).getTime() - now) / 3600000;
  if (gio < 0) return { text: `Quá hạn ${Math.ceil(-gio)} giờ`, cls: "late" };
  if (gio <= 24) return { text: `Còn ${Math.ceil(gio)} giờ`, cls: "soon" };
  return { text: `Còn ${Math.ceil(gio / 24)} ngày`, cls: "" };
}
