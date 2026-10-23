
import { ref, computed } from "vue";
import { ticketsApi } from "../api/tickets.api.js";
import { useAsync } from "../useAsync.js";
import { DataState } from "../components/DataState.js";
import {
  TRANG_THAI,
  UU_TIEN,
  fmtNgayGio,
  conHan,
} from "../format.js";

export const TicketAssignPage = {
  components: { DataState },
  props: {
    id: { type: String, required: true },
  },

  setup(props) {
    const { state, reload } = useAsync(async () => {
      const [ticket, goiY] = await Promise.all([
        ticketsApi.chiTiet(props.id),
        ticketsApi.goiY(props.id),
      ]);

      return { ticket, goiY };
    });

    const chon = ref(null);
    const lyDo = ref("");
    const gioDuKien = ref("");
    const dangLuu = ref(false);
    const loiLuu = ref(null);

    async function xacNhan() {
      if (chon.value === null || dangLuu.value) return;

      dangLuu.value = true;
      loiLuu.value = null;

      try {
        await ticketsApi.phanCong(
          props.id,
          chon.value,
          lyDo.value.trim() || undefined
        );

        location.hash = `#/tickets/${props.id}?assigned=1`;
      } catch (e) {
        loiLuu.value = e;

        if (e.status === 409) {
          chon.value = null;
          await reload();
        }
      } finally {
        dangLuu.value = false;
      }
    }

    const selectedTech = computed(() => (state.data?.goiY || []).find(k => k.id === chon.value) || null);
    return {
      selectedTech,
      state,
      reload,
      chon,
      lyDo,
      gioDuKien,
      dangLuu,
      loiLuu,
      xacNhan,
      TRANG_THAI,
      UU_TIEN,
      fmtNgayGio,
      conHan,
    };
  },

  template: `<section class="mock-page assign-page"><div class="mock-heading"><h1>Phân công kỹ thuật viên</h1><p>Tìm và phân công kỹ thuật viên</p></div>
<DataState :loading="state.loading" :error="state.error" :data="state.data" @retry="reload"><template #default="{data}">
<div class="assignment-grid"><div class="assignment-main"><div class="mock-card ticket-overview"><div class="phone-illustration">▣<small>Thiết bị</small></div><div class="ticket-overview-info"><h2>Mã: {{data.ticket.ticketCode}} <span class="priority-chip" :class="'priority-'+data.ticket.uuTien">{{UU_TIEN[data.ticket.uuTien]}}</span></h2><strong>Phiếu bảo hành</strong><p>Sự cố: {{data.ticket.moTaSuCo||'Chưa có mô tả chi tiết'}}</p><p>Nhóm sự cố: {{data.ticket.tenNhomSuCo||'Chưa phân loại'}}</p></div><div class="ticket-overview-deadline"><small>Thời gian</small><strong :class="conHan(data.ticket.hanCamKet).cls">◷ {{conHan(data.ticket.hanCamKet).text}}</strong><small>Hạn: {{fmtNgayGio(data.ticket.hanCamKet)}}</small><a :href="'#/tickets/'+data.ticket.ticketId">Xem chi tiết phiếu</a></div></div>
<div class="mock-card tech-panel"><div class="panel-title"><div><h2>♟ Danh sách kỹ thuật viên</h2><p>Danh sách kỹ thuật viên phù hợp với phiếu</p></div><span class="mini-sort">{{data.goiY.length}} ứng viên · Ưu tiên phù hợp</span></div>
<div v-if="data.ticket.trangThai!=='NEW'" class="mock-empty">Phiếu đã được phân công. <a :href="'#/tickets/'+data.ticket.ticketId">Xem chi tiết</a></div><div v-else-if="!data.goiY.length" class="mock-empty"><h3>Không có kỹ thuật viên phù hợp</h3><p>Kiểm tra trung tâm, kỹ năng hoặc dữ liệu nhân viên.</p><button @click="reload">Thử lại</button></div><div v-else class="tech-cards"><div v-for="(k,i) in data.goiY" :key="k.id" class="tech-card" :class="{chosen:chon===k.id}"><span class="tech-avatar">●</span><div class="tech-identity"><strong>{{k.hoTen}}</strong><small><span class="green-dot">●</span> {{i===0?'Gợi ý ưu tiên':'Đủ điều kiện'}}</small></div><div class="tech-skill"><small>Kỹ năng</small><strong>{{data.ticket.tenNhomSuCo||'Phù hợp'}}</strong><small>Tay nghề {{k.tayNghe}}/5</small></div><div class="tech-load"><small>Phiếu đang xử lý</small><strong>{{k.soPhieuDangXuLy}} phiếu</strong><small>Thuộc trung tâm phù hợp</small></div><button :disabled="dangLuu" @click="chon=k.id" :class="{chosen:chon===k.id}">{{chon===k.id?'Đã chọn':'Chọn'}}</button></div></div></div></div>
<aside class="mock-card assignment-side"><h2>ⓘ Thông tin phân công</h2><label class="side-label">1. Chọn kỹ thuật viên</label><div class="selected-tech" v-if="selectedTech"><span class="tech-avatar">●</span><div><strong>{{selectedTech.hoTen}}</strong><small>Tay nghề {{selectedTech.tayNghe}}/5 · {{selectedTech.soPhieuDangXuLy}} phiếu</small></div><span class="green-dot">●</span></div><div v-else class="selected-tech muted-selection">Chưa chọn kỹ thuật viên</div><label class="side-label">2. Ghi chú phân công (tùy chọn)</label><textarea v-model="lyDo" maxlength="500" rows="3" placeholder="Lưu ý cho kỹ thuật viên..."></textarea><div class="availability-box">✓ Kỹ thuật viên được gợi ý theo kỹ năng, trung tâm và khối lượng công việc</div><div class="side-info"><strong>Thông tin xử lý</strong><p>• Phiếu: {{data.ticket.ticketCode}}</p><p>• Nhóm sự cố: {{data.ticket.tenNhomSuCo||'—'}}</p><p>• Hạn xử lý: {{fmtNgayGio(data.ticket.hanCamKet)}}</p><p>• Lịch hẹn được đặt ở màn hình chi tiết sau khi phân công</p></div><div v-if="loiLuu" class="alert-bad">{{loiLuu.message}}</div><button class="red-button" :disabled="chon===null||dangLuu||data.ticket.trangThai!=='NEW'" @click="xacNhan">{{dangLuu?'Đang lưu...':'Xác nhận chọn'}}</button><a class="cancel-button" href="#/">Hủy</a></aside></div></template></DataState></section>`
};