export const KEY_REQUESTS = "jvc_roadside_requests";

const PHOTO_A = "https://placehold.co/360x240/e2e8f0/64748b?text=Vehicle+Photo+1";
const PHOTO_B = "https://placehold.co/360x240/e2e8f0/64748b?text=Issue+Photo+2";

export const INITIAL_REQUESTS = [
  {
    id: "AR-9012",
    clientName: "Client: Bilal",
    location: "DHA, Lahore",
    issue: "Car won't start",
    serviceName: "Battery jump",
    createdAt: "Today, 09:15",
    status: "new",
    locationMap: {
      address: "DHA Phase 5, Main Boulevard, Lahore",
      lat: 31.4697,
      lng: 74.4034,
    },
    vehicleDetails: {
      year: "2019",
      make: "Honda",
      model: "Civic",
      color: "Silver",
      plateNumber: "LEA-4521",
    },
    notes: "Engine cranks but won't start. Client is parked on the roadside near the main gate.",
    photos: [PHOTO_A, PHOTO_B],
  },
  {
    id: "AR-9008",
    clientName: "Client: Hira",
    location: "Gulshan, Karachi",
    issue: "Flat tire",
    serviceName: "Flat tire change",
    createdAt: "Yesterday, 18:40",
    status: "in_progress",
    locationMap: {
      address: "Gulshan-e-Iqbal Block 13-A, Karachi",
      lat: 24.9207,
      lng: 67.0658,
    },
    vehicleDetails: {
      year: "2021",
      make: "Toyota",
      model: "Yaris",
      color: "White",
      plateNumber: "KHI-8890",
    },
    notes: "Front right tire is completely flat. Spare tire is available in the trunk.",
    photos: [PHOTO_A],
  },
  {
    id: "AR-8999",
    clientName: "Client: Zain",
    location: "Blue Area, Islamabad",
    issue: "Battery jump needed",
    serviceName: "Towing",
    createdAt: "Yesterday, 10:02",
    status: "closed",
    locationMap: {
      address: "Jinnah Avenue, Blue Area, Islamabad",
      lat: 33.7077,
      lng: 73.0664,
    },
    vehicleDetails: {
      year: "2017",
      make: "Suzuki",
      model: "Cultus",
      color: "Blue",
      plateNumber: "ISB-3312",
    },
    notes: "Vehicle stalled in traffic and needs towing to the nearest workshop.",
    photos: [PHOTO_A, PHOTO_B],
  },
];

export function withRequestDefaults(request) {
  if (!request) return null;

  return {
    ...request,
    serviceName: request.serviceName || request.issue || "—",
    locationMap: {
      address: request.location || "",
      lat: null,
      lng: null,
      ...request.locationMap,
    },
    vehicleDetails: {
      year: "",
      make: "",
      model: "",
      color: "",
      plateNumber: "",
      ...request.vehicleDetails,
    },
    notes: request.notes || "",
    photos: Array.isArray(request.photos) ? request.photos : [],
  };
}

export function formatVehicleDetails(vehicle) {
  if (!vehicle) return "—";
  const parts = [
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" "),
    vehicle.color ? `Color: ${vehicle.color}` : "",
    vehicle.plateNumber ? `Plate: ${vehicle.plateNumber}` : "",
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

export function getMapEmbedUrl(locationMap) {
  const { lat, lng, address } = locationMap || {};
  if (lat != null && lng != null) {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  }
  if (address?.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(address.trim())}&output=embed`;
  }
  return null;
}

export function getMapLinkUrl(locationMap) {
  const { lat, lng, address } = locationMap || {};
  if (lat != null && lng != null) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  if (address?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
  }
  return null;
}
