export const KEY_EMERGENCIES = "jvc_support_emergencies";
export const KEY_ALERTS = "jvc_support_alerts";

export const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export const AVAILABLE_LAWYERS = [
  { id: "L-001", name: "Hamza Ali" },
  { id: "L-002", name: "Sana Malik" },
  { id: "L-003", name: "Omar Farooq" },
];

export const AVAILABLE_ROADSIDE_AGENTS = [
  { id: "U-2001", name: "Road Assist Agent - Imran" },
  { id: "U-2002", name: "Road Assist Agent - Bilal" },
];

export const INITIAL_EMERGENCIES = [
  {
    id: "EM-7001",
    clientName: "Client: Fatima Noor",
    type: "Accident",
    location: "Motorway M-2, km 45, near Lahore",
    priority: "critical",
    status: "open",
    assignedLawyerId: null,
    assignedLawyerName: null,
    dispatchedAgentId: null,
    dispatchedAgentName: null,
    createdAt: "Today, 10:42",
    description: "Multi-vehicle collision. Client reports injuries and needs legal guidance.",
    timeline: [
      { id: "TL-7001-1", at: "Today, 10:42", actor: "System", note: "Critical emergency reported from mobile app." },
    ],
  },
  {
    id: "EM-7002",
    clientName: "Client: Usman Shah",
    type: "Breakdown",
    location: "DHA Phase 6, Lahore",
    priority: "high",
    status: "lawyer_assigned",
    assignedLawyerId: "L-002",
    assignedLawyerName: "Sana Malik",
    dispatchedAgentId: null,
    dispatchedAgentName: null,
    createdAt: "Today, 10:18",
    description: "Vehicle stalled on main road. Client requested roadside help and legal callback.",
    timeline: [
      { id: "TL-7002-1", at: "Today, 10:18", actor: "System", note: "High-priority emergency queued." },
      { id: "TL-7002-2", at: "Today, 10:22", actor: "Support Agent", note: "Lawyer assigned: Sana Malik." },
    ],
  },
  {
    id: "EM-7003",
    clientName: "Client: Aisha Khan",
    type: "Legal consultation",
    location: "Gulshan, Karachi",
    priority: "medium",
    status: "dispatched",
    assignedLawyerId: "L-001",
    assignedLawyerName: "Hamza Ali",
    dispatchedAgentId: "U-2001",
    dispatchedAgentName: "Road Assist Agent - Imran",
    createdAt: "Today, 09:55",
    description: "Minor fender bender. Lawyer and roadside both requested.",
    timeline: [
      { id: "TL-7003-1", at: "Today, 09:55", actor: "System", note: "Emergency added to live queue." },
      { id: "TL-7003-2", at: "Today, 09:58", actor: "Support Agent", note: "Lawyer assigned: Hamza Ali." },
      { id: "TL-7003-3", at: "Today, 10:01", actor: "Support Agent", note: "Roadside dispatched: Road Assist Agent - Imran." },
    ],
  },
  {
    id: "EM-7004",
    clientName: "Client: Zain Abbas",
    type: "Insurance dispute",
    location: "Blue Area, Islamabad",
    priority: "low",
    status: "open",
    assignedLawyerId: null,
    assignedLawyerName: null,
    dispatchedAgentId: null,
    dispatchedAgentName: null,
    createdAt: "Today, 09:30",
    description: "Client needs legal advice on claim documentation only.",
    timeline: [
      { id: "TL-7004-1", at: "Today, 09:30", actor: "System", note: "Low-priority request received." },
    ],
  },
];

export const INITIAL_ALERTS = [
  {
    id: "AL-9001",
    emergencyId: "EM-7001",
    message: "New critical emergency: Accident on Motorway M-2",
    severity: "critical",
    createdAt: "Today, 10:42",
    read: false,
  },
  {
    id: "AL-9002",
    emergencyId: "EM-7002",
    message: "Client waiting for roadside dispatch (lawyer already assigned)",
    severity: "high",
    createdAt: "Today, 10:25",
    read: false,
  },
  {
    id: "AL-9003",
    emergencyId: "EM-7003",
    message: "Roadside agent en route — ETA 12 min",
    severity: "medium",
    createdAt: "Today, 10:05",
    read: true,
  },
];

export function formatNow() {
  const d = new Date();
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `Today, ${h12}:${m} ${ampm}`;
}

export function appendTimelineEntry(timeline, { actor, note }) {
  return [
    ...(Array.isArray(timeline) ? timeline : []),
    {
      id: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: formatNow(),
      actor,
      note,
    },
  ];
}

export function sortEmergenciesByPriority(list) {
  return [...list].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 99;
    const pb = PRIORITY_ORDER[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
}

export function priorityLabel(priority) {
  if (!priority) return "—";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function statusLabel(status) {
  switch (status) {
    case "open":
      return "Open";
    case "lawyer_assigned":
      return "Lawyer assigned";
    case "dispatched":
      return "Dispatched";
    case "resolved":
      return "Resolved";
    default:
      return status || "—";
  }
}

export function withEmergencyDefaults(emergency) {
  if (!emergency) return null;
  return {
    ...emergency,
    timeline: Array.isArray(emergency.timeline) ? emergency.timeline : [],
    assignedLawyerId: emergency.assignedLawyerId || null,
    assignedLawyerName: emergency.assignedLawyerName || null,
    dispatchedAgentId: emergency.dispatchedAgentId || null,
    dispatchedAgentName: emergency.dispatchedAgentName || null,
  };
}
