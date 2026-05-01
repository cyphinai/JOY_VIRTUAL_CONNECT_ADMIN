export const USERS_STORAGE_KEY = "jvc_users";

export const USER_TYPE_OPTIONS = [
  { value: "client", label: "Client" },
  { value: "lawyer", label: "Lawyer" },
  { value: "roadside_assistance_agent", label: "Roadside Assistance Agent" },
  { value: "insurance_agent", label: "Insurance Agent" },
  { value: "super_admin", label: "Super Admin" },
];

/** Panel accounts that sign in with email + password (created by super admin) */
export const TYPES_WITH_LOGIN = ["super_admin", "roadside_assistance_agent", "insurance_agent"];

export function needsLoginCredentials(type) {
  return TYPES_WITH_LOGIN.includes(type);
}

export const DEFAULT_USERS = [
  { id: "U-9001", name: "System Admin", type: "super_admin", status: "active", email: "admin@joyvc.com", password: "Admin@123" },
  { id: "U-1001", name: "Ayesha Khan", type: "client", status: "active", email: "ayesha@example.com", password: "" },
  { id: "U-1002", name: "Hamza Ali", type: "lawyer", status: "active", email: "hamza@example.com", password: "" },
  {
    id: "U-2001",
    name: "Road Assist Agent - Imran",
    type: "roadside_assistance_agent",
    status: "active",
    email: "roadside@joyvc.com",
    password: "Roadside@123",
  },
  {
    id: "U-3001",
    name: "Insurance Agent - Sara",
    type: "insurance_agent",
    status: "active",
    email: "insurance@joyvc.com",
    password: "Insurance@123",
  },
];

export function isValidId(id) {
  return /^U-\d{4,6}$/i.test(String(id || "").trim());
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
}

export function validateUser(
  { id, name, type, status, email, password },
  { users, editingId, mode = "create" }
) {
  const next = {};
  const sid = String(id || "").trim();
  const sname = String(name || "").trim();
  const semail = String(email || "").trim();
  const spassword = String(password || "");

  if (!sid) next.id = "User ID is required.";
  else if (!isValidId(sid)) next.id = "Format should be like U-1001.";
  else {
    const idTaken = users.some(
      (u) => u.id.toLowerCase() === sid.toLowerCase() && (!editingId || u.id !== editingId)
    );
    if (idTaken) next.id = "User ID already exists.";
  }
  if (!sname) next.name = "Name is required.";
  else if (sname.length < 2) next.name = "Name is too short.";
  if (!type) next.type = "Type is required.";
  if (!status) next.status = "Status is required.";

  const creds = needsLoginCredentials(type);
  if (creds) {
    if (!semail) next.email = "Email is required for this user type.";
    else if (!isValidEmail(semail)) next.email = "Enter a valid email address.";
    else {
      const emailTaken = users.some(
        (u) =>
          u.email &&
          u.email.toLowerCase() === semail.toLowerCase() &&
          (!editingId || u.id !== editingId)
      );
      if (emailTaken) next.email = "This email is already in use.";
    }
    if (mode === "create" && !spassword) {
      next.password = "Set a password for this account (min 6 characters).";
    } else if (spassword && spassword.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }
  } else {
    if (semail && !isValidEmail(semail)) next.email = "Enter a valid email address.";
  }

  return { valid: Object.keys(next).length === 0, errors: next };
}

export function toUserFromForm({ id, name, type, status, email, password }, { previous, mode } = {}) {
  const u = {
    id: String(id).trim(),
    name: String(name).trim(),
    type,
    status,
    email: String(email || "").trim(),
  };
  if (needsLoginCredentials(type)) {
    if (mode === "create" || (password && String(password).length > 0)) {
      u.password = String(password);
    } else if (previous?.password) {
      u.password = previous.password;
    } else {
      u.password = "";
    }
  } else {
    u.password = "";
  }
  return u;
}

export function readUsersFromStorage() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Merges `jvc_users` in localStorage with `DEFAULT_USERS` by id.
 * Old saves often lack email/password; defaults restore demo sign-in for the same user ids.
 * Custom users (unknown id) are kept as stored.
 */
export function getUsersForLogin() {
  const raw = readUsersFromStorage();
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_USERS;
  }
  const merged = raw.map((u) => {
    const d = DEFAULT_USERS.find((x) => x.id === u.id);
    if (!d) {
      return u;
    }
    const email = (u.email && String(u.email).trim()) ? String(u.email).trim() : d.email;
    const hasPw = u.password != null && String(u.password).trim() !== "";
    const password = hasPw ? String(u.password).trim() : d.password;
    return { ...d, ...u, email, password, status: u.status ?? d.status, type: u.type ?? d.type, name: u.name ?? d.name };
  });
  const ids = new Set(merged.map((x) => x.id));
  for (const d of DEFAULT_USERS) {
    if (!ids.has(d.id)) {
      merged.push({ ...d });
    }
  }
  return merged;
}
