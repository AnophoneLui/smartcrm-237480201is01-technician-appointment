// Lỗi nghiệp vụ có mã máy đọc (code) để frontend rẽ nhánh, không dựa vào câu chữ.
class AppError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
module.exports = { AppError };
