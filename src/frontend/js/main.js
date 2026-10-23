import { createApp, ref, computed } from "vue";
import { TicketListPage } from "./pages/TicketListPage.js";
import { TicketAssignPage } from "./pages/TicketAssignPage.js";
import { TicketDetailPage } from "./pages/TicketDetailPage.js";

// Bộ định tuyến theo hash: #/  ·  #/tickets/:id  ·  #/tickets/:id/assign
const hash = ref(location.hash || "#/");
window.addEventListener("hashchange", () => { hash.value = location.hash || "#/"; });

createApp({
  setup() {
    const route = computed(() => {
      const [path, query = ""] = hash.value.slice(1).split("?");
      let m;
      if ((m = path.match(/^\/tickets\/(\d+)\/assign$/))) return { page: TicketAssignPage, props: { id: m[1] }, key: hash.value };
      if ((m = path.match(/^\/tickets\/(\d+)$/))) return { page: TicketDetailPage, props: { id: m[1], justAssigned: query.includes("assigned=1") }, key: hash.value };
      return { page: TicketListPage, props: { initialStatus: query.includes("status=NEW") ? "new" : "all" }, key: "list:" + query };
    });
    return { route };
  },
  template: `<component :is="route.page" v-bind="route.props" :key="route.key" />`,
}).mount("#app");
