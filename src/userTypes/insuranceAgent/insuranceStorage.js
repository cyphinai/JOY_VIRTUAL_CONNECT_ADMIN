export const KEY_REQUESTS = "jvc_insurance_quote_requests";
export const KEY_QUOTES_BY_REQUEST = "jvc_insurance_quotes_by_request";
export const KEY_DRAFTS = "jvc_insurance_compose_drafts";
export const KEY_SENT = "jvc_insurance_sent_quotes";

export const INITIAL_REQUESTS = [
  {
    id: "QR-5001",
    clientName: "Client: Ali",
    vehicle: "Toyota Corolla 2018",
    city: "Lahore",
    createdAt: "Today, 10:05",
    status: "new",
  },
  {
    id: "QR-4998",
    clientName: "Client: Sana",
    vehicle: "Honda City 2020",
    city: "Karachi",
    createdAt: "Yesterday, 19:12",
    status: "in_review",
  },
  {
    id: "QR-4987",
    clientName: "Client: Ahmed",
    vehicle: "Suzuki Alto 2022",
    city: "Islamabad",
    createdAt: "Yesterday, 11:30",
    status: "quoted",
  },
];

export const INITIAL_QUOTES_BY_REQUEST = {
  "QR-4987": {
    premiumPkr: "24,000",
    coverage: "Comprehensive",
    duration: "12 months",
    notes: "Includes roadside coverage add-on",
    createdAt: "Yesterday, 12:10",
  },
};
