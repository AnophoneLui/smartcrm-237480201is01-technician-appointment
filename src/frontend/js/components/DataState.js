// Ba trạng thái dùng chung: đang tải · rỗng · lỗi. Có dữ liệu thì hiện nội dung (slot mặc định).
export const DataState = {
  props: {
    loading: Boolean,
    error: { type: Object, default: null },
    data: { default: null },
    empty: { type: Object, default: () => ({}) },
  },
  emits: ["retry"],
  computed: {
    isEmpty() { return !this.data || (Array.isArray(this.data) && this.data.length === 0); },
  },
  template: `
    <div v-if="loading" class="state skeleton" role="status">Đang tải dữ liệu…</div>
    <div v-else-if="error" class="state state-error" role="alert">
      <p><strong>{{ error.message }}</strong></p>
      <p v-if="error.traCuu" class="muted">Mã tra cứu: {{ error.traCuu }}</p>
      <button @click="$emit('retry')">Thử lại</button>
    </div>
    <div v-else-if="isEmpty" class="state state-empty">
      <p>{{ empty.message || 'Chưa có dữ liệu nào.' }}</p>
      <slot name="empty-action" />
    </div>
    <slot v-else :data="data" />`,
};
