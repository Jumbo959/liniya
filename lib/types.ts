export type ApartmentStatus = "available" | "reserved" | "sold";

export type RoomKind =
  | "living"
  | "bedroom"
  | "kitchen"
  | "bath"
  | "hall"
  | "wardrobe"
  | "balcony";

export type WindowSide = "north" | "south" | "east" | "west";

export type Finishing = "без отделки" | "white box" | "чистовая";

export type PlanType = "studio" | "one" | "two" | "two-wide" | "three";

export type PlanRoom = {
  name: string;
  x: number;
  y: number;
  w: number;
  d: number;
  kind: RoomKind;
};

export type Apartment = {
  id: string;
  floor: number;
  position: number;
  rooms: number;
  title: string;
  area: number;
  ceiling: number;
  price: number;
  status: ApartmentStatus;
  reservedUntil: string | null;
  view: string;
  finishing: Finishing;
  windowSides: WindowSide[];
  planType: PlanType;
  plan: PlanRoom[];
  features: string[];
  blurb: string;
  photoUrls: string[];
  internalNote: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadType = "booking" | "viewing" | "consult" | "mortgage" | "waitlist";

export type LeadStatus = "new" | "call" | "meeting" | "reserved" | "won" | "lost";

export type Lead = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  type: LeadType;
  apartmentId: string | null;
  message: string;
  time: string;
  status: LeadStatus;
  managerNote: string;
};

export type FeedTarget = "avito" | "yandex" | "cian" | "domclick";

export type FeedLog = {
  id: string;
  at: string;
  target: FeedTarget | "pull-avito" | "pull-yandex";
  count: number;
  note: string;
};

export type Settings = {
  complexName: string;
  developer: string;
  phone: string;
  phoneDisplay: string;
  email: string;
  city: string;
  district: string;
  address: string;
  siteUrl: string;
  newDevelopmentId: string;
  bookingDeposit: number;
  bookingDays: number;
  exportReserved: boolean;
  exportSold: boolean;
  latitude: string;
  longitude: string;
  salesName: string;
};

export type HouseEvent = {
  at: string;
  text: string;
};

export type Database = {
  apartments: Apartment[];
  leads: Lead[];
  settings: Settings;
  feedLog: FeedLog[];
  events: HouseEvent[];
};

export type PublicApartment = Omit<Apartment, "internalNote">;
