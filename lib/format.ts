import type { ApartmentStatus, LeadStatus, LeadType } from "./types";

export function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + "\u00a0₽";
}

export function formatRent(value: number) {
  return formatPrice(value) + "/мес";
}

export function formatMillions(value: number) {
  const n = value / 1_000_000;
  return (
    new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: n >= 10 ? 1 : 2,
      maximumFractionDigits: n >= 10 ? 1 : 2,
    }).format(n) + "\u00a0млн\u00a0₽"
  );
}

export function formatArea(value: number) {
  return (
    new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value) + "\u00a0м²"
  );
}

export function formatPerM(price: number, area: number) {
  if (!area) return "—";
  return formatPrice(Math.round(price / area)) + "/м²";
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function roomsShort(rooms: number) {
  if (rooms <= 0) return "студия";
  return `${rooms}\u00a0комн.`;
}

export function roomsLong(rooms: number) {
  if (rooms <= 0) return "Студия";
  if (rooms === 1) return "1-комнатная";
  if (rooms === 2) return "2-комнатная";
  if (rooms === 3) return "3-комнатная";
  return `${rooms}-комнатная`;
}

export function statusLabel(status: ApartmentStatus) {
  if (status === "available") return "свободна";
  if (status === "reserved") return "на просмотре";
  return "занята";
}

export function leadTypeLabel(type: LeadType) {
  const map: Record<LeadType, string> = {
    booking: "Удержать квартиру",
    viewing: "Просмотр",
    consult: "Вопрос",
    mortgage: "Условия",
    waitlist: "Лист ожидания",
  };
  return map[type];
}

export function leadStatusLabel(status: LeadStatus) {
  const map: Record<LeadStatus, string> = {
    new: "новая",
    call: "созвон",
    meeting: "встреча",
    reserved: "удержали",
    won: "заехали",
    lost: "отказ",
  };
  return map[status];
}

export function floorLabel(floor: number) {
  return `${floor}\u00a0этаж`;
}

export function csvCell(value: string | number) {
  const raw = String(value ?? "");
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function digitsPhone(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (digits.length === 10) digits = "7" + digits;
  return digits;
}
