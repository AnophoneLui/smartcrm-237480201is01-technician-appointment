import { request } from "./client.js";

export const ticketsApi = {
  danhSach: ({ status, limit = 100 } = {}) => {
    const q = new URLSearchParams({ limit: String(limit) });
    if (status) q.set("status", status);
    return request(`/api/tickets?${q}`);
  },
  chiTiet: (id) => request(`/api/tickets/${id}`),
  goiY: (id) => request(`/api/tickets/${id}/suggestions`),
  phanCong: (id, technicianId, reason) =>
    request(`/api/tickets/${id}/technician`, { method: "PATCH", body: JSON.stringify({ technicianId, reason }) }),
  lichHen: (id) => request(`/api/tickets/${id}/appointments`),
  doiLichHen: (id, gioHen) =>
    request(`/api/tickets/${id}/appointments/current`, { method: "PUT", body: JSON.stringify({ gioHen }) }),
  datLichHen: (id, gioHen) =>
    request(`/api/tickets/${id}/appointments`, { method: "POST", body: JSON.stringify({ gioHen }) }),
};
