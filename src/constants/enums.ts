export const VehicleStatuses = ["available", "on_road", "maintenance", "out_of_service"] as const;
export type VehicleStatus = (typeof VehicleStatuses)[number];

export const DriverStatuses = ["active", "inactive", "suspended"] as const;
export type DriverStatus = (typeof DriverStatuses)[number];

export const TransportOrderStatuses = ["new", "approved", "on_road", "delivered", "cancelled"] as const;
export type TransportOrderStatus = (typeof TransportOrderStatuses)[number];

export const TripStatuses = ["planned", "in_progress", "completed", "cancelled"] as const;
export type TripStatus = (typeof TripStatuses)[number];

export const MaintenanceTypes = ["oil_change", "tires", "brakes", "inspection", "repair", "other"] as const;
export type MaintenanceType = (typeof MaintenanceTypes)[number];

export const PurchaseStatuses = [
  "draft",
  "submitted",
  "approved",
  "ordered",
  "received",
  "invoiced",
  "paid",
  "cancelled",
] as const;
export type PurchaseStatus = (typeof PurchaseStatuses)[number];

export const UserRoles = ["admin", "dispatcher", "accounting", "viewer"] as const;
export type UserRole = (typeof UserRoles)[number];

