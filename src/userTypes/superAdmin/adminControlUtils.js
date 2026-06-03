import { ROLES } from "../../app/auth/auth";
import { KEY_REQUESTS as ROADSIDE_KEY, INITIAL_REQUESTS as ROADSIDE_INITIAL } from "../roadsideAssistanceAgent/roadsideStorage";
import {
  KEY_REQUESTS as INSURANCE_KEY,
  INITIAL_REQUESTS as INSURANCE_INITIAL,
} from "../insuranceAgent/insuranceStorage";
import {
  KEY_EMERGENCIES,
  KEY_ALERTS,
  INITIAL_EMERGENCIES,
  INITIAL_ALERTS,
} from "../supportAgent/supportStorage";

export const KEY_AUDIT_LOG = "jvc_super_admin_audit";

export const PANEL_ADMIN_TYPES = [
  ROLES.ROAD_ASSIST_AGENT,
  ROLES.INSURANCE_AGENT,
  ROLES.SUPPORT_AGENT,
];

export const INITIAL_AUDIT_LOG = [
  {
    id: "AUD-1001",
    at: "Today, 08:30",
    actor: "System Admin",
    action: "Reviewed admin control center",
    target: "All panel admins",
  },
];

export function isPanelAdminType(type) {
  return PANEL_ADMIN_TYPES.includes(type);
}

export function userTypeLabel(type) {
  switch (type) {
    case ROLES.ROAD_ASSIST_AGENT:
      return "Roadside Assistance Agent";
    case ROLES.INSURANCE_AGENT:
      return "Insurance Agent";
    case ROLES.SUPPORT_AGENT:
      return "Support Agent";
    case ROLES.SUPER_ADMIN:
      return "Super Admin";
    case "client":
      return "Client";
    case "lawyer":
      return "Lawyer";
    default:
      return type || "—";
  }
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function formatNow() {
  const d = new Date();
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `Today, ${h12}:${m} ${ampm}`;
}

export function createAuditEntry({ actor, action, target }) {
  return {
    id: `AUD-${Date.now()}`,
    at: formatNow(),
    actor: actor || "Super Admin",
    action,
    target: target || "—",
  };
}

export function getGlobalOperationalStats() {
  const roadside = readJson(ROADSIDE_KEY, ROADSIDE_INITIAL);
  const insurance = readJson(INSURANCE_KEY, INSURANCE_INITIAL);
  const emergencies = readJson(KEY_EMERGENCIES, INITIAL_EMERGENCIES);
  const alerts = readJson(KEY_ALERTS, INITIAL_ALERTS);

  return {
    roadsideOpen: roadside.filter((r) => r.status !== "closed").length,
    insuranceOpen: insurance.filter((r) => r.status !== "quoted").length,
    supportLive: emergencies.filter((e) => e.status !== "resolved").length,
    supportAlerts: alerts.filter((a) => !a.read).length,
  };
}

export function getAdminWorkloadSummary(type) {
  const stats = getGlobalOperationalStats();
  switch (type) {
    case ROLES.ROAD_ASSIST_AGENT:
      return `${stats.roadsideOpen} open assistance requests`;
    case ROLES.INSURANCE_AGENT:
      return `${stats.insuranceOpen} pending quote requests`;
    case ROLES.SUPPORT_AGENT:
      return `${stats.supportLive} live emergencies · ${stats.supportAlerts} unread alerts`;
    default:
      return "—";
  }
}

export function getOversightRoute(type) {
  switch (type) {
    case ROLES.ROAD_ASSIST_AGENT:
      return "/roadside/requests";
    case ROLES.INSURANCE_AGENT:
      return "/insurance/quotes";
    case ROLES.SUPPORT_AGENT:
      return "/support/command-center";
    default:
      return null;
  }
}
