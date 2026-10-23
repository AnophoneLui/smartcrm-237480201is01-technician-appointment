// Local-only incident notes until the backend exposes a verified update endpoint.
const PREFIX = 'smartcrm:incident-note:v1:';
export function incidentDescription(ticket) {
  if (!ticket) return '';
  try {
    const local = window.localStorage.getItem(PREFIX + ticket.ticketId);
    if (local !== null) return local;
  } catch (_) { /* storage unavailable: fall back to API */ }
  return ticket.moTaSuCo || '';
}
export function saveIncidentDescription(id, description) {
  window.localStorage.setItem(PREFIX + id, description.trim());
}
