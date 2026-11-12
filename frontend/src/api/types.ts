import type { components, paths } from "./schema";

export type Schemas = components["schemas"];

export type Resource = Schemas["ResourceRead"];
export type ResourceCreate = Schemas["ResourceCreate"];
export type ResourceUpdate = Schemas["ResourceUpdate"];

export type User = Schemas["UserResponse"];
export type UserRole = "student" | "profesor" | "administrator";

export type Reservation = Schemas["ReservationRead"];
export type ReservationCreate = Schemas["ReservationCreate"];
export type ReservationStatus = "ACTIVA" | "ANULATA" | "FINALIZATA" | "NEPREZENTARE";
export type PaymentStatus = "ACHITATA" | "NEACHITATA";

export type AvailabilitySlot = Schemas["AvailabilitySlot"];
export type SlotStatus = "liber" | "ocupat" | "mentenanta";

export type MaintenanceBlock = Schemas["MaintenanceBlockRead"];
export type MaintenanceBlockCreate = Schemas["MaintenanceBlockCreate"];

export type FinancialReport = Schemas["FinancialReport"];
export type OccupancyReport = Schemas["OccupancyReport"];

export type { paths };

