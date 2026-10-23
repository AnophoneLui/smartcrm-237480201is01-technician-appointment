import { reactive } from "vue";

// Trạng thái lấy dữ liệu: { data, loading, error } + reload(). Bỏ qua kết quả của lần gọi cũ.
export function useAsync(fn) {
  const state = reactive({ data: null, loading: true, error: null });
  let seq = 0;
  async function reload() {
    const my = ++seq;
    state.loading = true; state.error = null;
    try { const d = await fn(); if (my === seq) state.data = d; }
    catch (e) { if (my === seq) { state.error = e; state.data = null; } }
    finally { if (my === seq) state.loading = false; }
  }
  reload();
  return { state, reload };
}
