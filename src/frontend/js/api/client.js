// Chỗ DUY NHẤT biết về HTTP. Component/trang không được chứa chữ "fetch".
const BASE = window.APP_CONFIG?.API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(status, code, message, fields, traCuu) {
    super(message);
    this.status = status;   // mã HTTP (0 nếu mất kết nối)
    this.code = code;       // mã máy đọc do backend trả về
    this.fields = fields;   // lỗi theo từng trường (nếu có)
    this.traCuu = traCuu;   // mã tra cứu log (lỗi 500)
  }
}

export async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new ApiError(0, "MAT_KET_NOI",
      "Không kết nối được tới hệ thống. Hãy kiểm tra backend đã chạy chưa rồi bấm Thử lại.");
  }
  if (res.status === 204) return null;
  let body = null;
  try { body = await res.json(); } catch { /* phản hồi không phải JSON */ }
  if (!res.ok) {
    throw new ApiError(res.status, body?.error,
      body?.message || "Hệ thống đang gặp sự cố. Vui lòng thử lại.", body?.fields, body?.maTraCuu);
  }
  return body?.data ?? body;
}
