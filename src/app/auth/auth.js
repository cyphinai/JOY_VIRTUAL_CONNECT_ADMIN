import { getUsersForLogin } from "../../userTypes/superAdmin/userFormUtils";

const STORAGE_KEY = "jvc_admin_auth";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ROAD_ASSIST_AGENT: "roadside_assistance_agent",
  INSURANCE_AGENT: "insurance_agent",
};

export function typeToPanelRole(type) {
  if (type === "super_admin") return ROLES.SUPER_ADMIN;
  if (type === "roadside_assistance_agent") return ROLES.ROAD_ASSIST_AGENT;
  if (type === "insurance_agent") return ROLES.INSURANCE_AGENT;
  return null;
}

/**
 * Returns session payload for AuthProvider, or { error: string }.
 * Only super_admin, roadside_assistance_agent, and insurance_agent can use this admin panel.
 */
export function tryLoginWithEmailPassword(email, password) {
  const em = String(email || "").trim().toLowerCase();
  const pw = String(password || "").trim();
  if (!em || !pw) {
    return { error: "Enter email and password." };
  }
  const users = getUsersForLogin();
  const user = users.find((u) => {
    if (!u.email || u.status === "disabled") return false;
    const uem = String(u.email).trim().toLowerCase();
    const upw = String(u.password == null ? "" : u.password).trim();
    return uem === em && upw === pw;
  });
  if (!user) {
    return {
      error:
        "Invalid email or password, or account disabled. Try demo: admin@joyvc.com / Admin@123 (clear site data if an old user list has no passwords).",
    };
  }
  const role = typeToPanelRole(user.type);
  if (!role) {
    return { error: "This account is not allowed to use the admin panel. Use the mobile app." };
  }
  return {
    user: {
      role,
      name: user.name,
      email: user.email,
      userId: user.id,
      type: user.type,
    },
  };
}

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function storeAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function roleLabel(role) {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return "Super Admin";
    case ROLES.ROAD_ASSIST_AGENT:
      return "Roadside Assistance Agent";
    case ROLES.INSURANCE_AGENT:
      return "Insurance Agent";
    default:
      return "Unknown";
  }
}

