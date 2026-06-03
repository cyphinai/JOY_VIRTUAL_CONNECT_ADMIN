export const KEY_REQUESTS = "jvc_insurance_quote_requests";
export const KEY_QUOTES_BY_REQUEST = "jvc_insurance_quotes_by_request";
export const KEY_DRAFTS = "jvc_insurance_compose_drafts";
export const KEY_SENT = "jvc_insurance_sent_quotes";

const PLACEHOLDER_LICENSE =
  "https://placehold.co/480x300/e2e8f0/64748b?text=Driver+License+Scan";
const PLACEHOLDER_VIN = "https://placehold.co/480x300/e2e8f0/64748b?text=Vehicle+VIN+Scan";

export const INITIAL_REQUESTS = [
  {
    id: "QR-5001",
    clientName: "Client: Ali Ahmed",
    vehicle: "Toyota Corolla 2018",
    city: "Lahore",
    createdAt: "Today, 10:05",
    status: "new",
    personal: {
      driverLicenseImage: PLACEHOLDER_LICENSE,
      fullName: "Ali Ahmed",
      nationalIdentityNumber: "35202-1234567-1",
      address: "42 Gulberg III, Lahore, Punjab",
      email: "ali.ahmed@example.com",
      phone: "+92 300 1234567",
    },
    vehicleDetails: {
      vinScanImage: PLACEHOLDER_VIN,
      year: "2018",
      make: "Toyota",
      model: "Corolla",
      vin: "JTDBR32E080123456",
    },
    garagingAddress: "42 Gulberg III, Lahore, Punjab",
    annualMiles: "12,000",
    coverage: {
      level: "better",
      deductibleUsd: "500",
    },
    insurance: {
      currentInsurance: "active",
      previousInsurerName: "State Life Insurance",
      lapseInCoverage: false,
      lapseDuration: "",
    },
  },
  {
    id: "QR-4998",
    clientName: "Client: Sana Khan",
    vehicle: "Honda City 2020",
    city: "Karachi",
    createdAt: "Yesterday, 19:12",
    status: "in_review",
    personal: {
      driverLicenseImage: PLACEHOLDER_LICENSE,
      fullName: "Sana Khan",
      nationalIdentityNumber: "42101-9876543-2",
      address: "18 Clifton Block 5, Karachi, Sindh",
      email: "sana.khan@example.com",
      phone: "+92 321 7654321",
    },
    vehicleDetails: {
      vinScanImage: PLACEHOLDER_VIN,
      year: "2020",
      make: "Honda",
      model: "City",
      vin: "MRHGM5670LP012345",
    },
    garagingAddress: "18 Clifton Block 5, Karachi, Sindh",
    annualMiles: "8,500",
    coverage: {
      level: "best",
      deductibleUsd: "250",
    },
    insurance: {
      currentInsurance: "expired",
      previousInsurerName: "EFU General Insurance",
      lapseInCoverage: true,
      lapseDuration: "2 months",
    },
  },
  {
    id: "QR-4987",
    clientName: "Client: Ahmed Raza",
    vehicle: "Suzuki Alto 2022",
    city: "Islamabad",
    createdAt: "Yesterday, 11:30",
    status: "quoted",
    personal: {
      driverLicenseImage: PLACEHOLDER_LICENSE,
      fullName: "Ahmed Raza",
      nationalIdentityNumber: "61101-4567890-3",
      address: "7 F-10 Markaz, Islamabad",
      email: "ahmed.raza@example.com",
      phone: "+92 333 9988776",
    },
    vehicleDetails: {
      vinScanImage: PLACEHOLDER_VIN,
      year: "2022",
      make: "Suzuki",
      model: "Alto",
      vin: "MA3CFC61SNA123789",
    },
    garagingAddress: "7 F-10 Markaz, Islamabad",
    annualMiles: "6,200",
    coverage: {
      level: "good",
      deductibleUsd: "1,000",
    },
    insurance: {
      currentInsurance: "none",
      previousInsurerName: "—",
      lapseInCoverage: false,
      lapseDuration: "",
    },
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

export function withRequestDefaults(request) {
  if (!request) return null;

  const fullName =
    request.personal?.fullName || request.clientName?.replace(/^Client:\s*/i, "") || "—";

  return {
    ...request,
    personal: {
      driverLicenseImage: "",
      fullName,
      nationalIdentityNumber: "",
      address: "",
      email: "",
      phone: "",
      ...request.personal,
    },
    vehicleDetails: {
      vinScanImage: "",
      year: "",
      make: "",
      model: "",
      vin: "",
      ...request.vehicleDetails,
    },
    garagingAddress: request.garagingAddress || request.city || "—",
    annualMiles: request.annualMiles ?? "—",
    coverage: {
      level: "good",
      deductibleUsd: "",
      ...request.coverage,
    },
    insurance: {
      currentInsurance: "none",
      previousInsurerName: "",
      lapseInCoverage: false,
      lapseDuration: "",
      ...request.insurance,
    },
  };
}

export function formatCoverageLevel(level) {
  if (!level) return "—";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function formatCurrentInsurance(status) {
  if (status === "none") return "None";
  if (status === "expired") return "Expired";
  if (status === "active") return "Active";
  return status || "—";
}

export function formatLapseInCoverage(insurance) {
  if (!insurance?.lapseInCoverage) return "No";
  const duration = insurance.lapseDuration?.trim();
  return duration ? `Yes (${duration})` : "Yes";
}
