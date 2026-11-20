"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apartmentArea } from "./areas";
import { COOKIE, checkPassword, isAuthed, signSession } from "./auth";
import { addBusinessDays } from "./mortgage";
import { readDb, resetDb, updateDb } from "./store";
import type {
  Apartment,
  ApartmentStatus,
  FeedTarget,
  Finishing,
  LeadStatus,
  LeadType,
  PlanRoom,
  PlanType,
  RoomKind,
  Settings,
  WindowSide,
} from "./types";

async function guard() {
  const jar = await cookies();
  if (!isAuthed(jar.get(COOKIE)?.value)) return false;
  return true;
}

const FINISHING: Finishing[] = ["без отделки", "white box", "чистовая"];
const KINDS: RoomKind[] = ["living", "bedroom", "kitchen", "bath", "hall", "wardrobe", "balcony"];
const SIDES: WindowSide[] = ["north", "south", "east", "west"];
const STATUSES: ApartmentStatus[] = ["available", "reserved", "sold"];
const LEAD_TYPES: LeadType[] = ["booking", "viewing", "consult", "mortgage", "waitlist"];
const LEAD_STATUSES: LeadStatus[] = ["new", "call", "meeting", "reserved", "won", "lost"];
const PLAN_TYPES: PlanType[] = ["studio", "one", "two", "two-wide", "three"];

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (!checkPassword(password)) return { error: "Неверный пароль" };
  const jar = await cookies();
  jar.set(COOKIE, signSession(), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 });
  redirect("/admin");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(COOKIE);
  redirect("/admin/login");
}

function cleanRooms(input: unknown): PlanRoom[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;
  const rooms: PlanRoom[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") return null;
    const room = raw as Partial<PlanRoom>;
    const kind = room.kind;
    if (!kind || !KINDS.includes(kind)) return null;
    const x = Number(room.x);
    const y = Number(room.y);
    const w = Number(room.w);
    const d = Number(room.d);
    if (![x, y, w, d].every((n) => Number.isFinite(n)) || w <= 0 || d <= 0) return null;
    rooms.push({
      name: String(room.name || "Комната").trim().slice(0, 40) || "Комната",
      x,
      y,
      w,
      d,
      kind,
    });
  }
  return rooms;
}

export type ApartmentDraft = {
  originalId: string | null;
  id: string;
  floor: number;
  position: number;
  rooms: number;
  title: string;
  price: number;
  status: ApartmentStatus;
  reservedUntil: string | null;
  view: string;
  finishing: Finishing;
  windowSides: WindowSide[];
  planType: PlanType;
  plan: PlanRoom[];
  blurb: string;
  photoUrls: string[];
  internalNote: string;
  ceiling: number;
};

export async function saveApartment(draft: ApartmentDraft): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!(await guard())) return { ok: false, error: "Нужна авторизация" };
  const id = draft.id.trim();
  if (!/^\d{2,4}$/.test(id)) return { ok: false, error: "Номер квартиры — 2–4 цифры, например 204" };
  if (!Number.isFinite(draft.floor) || draft.floor < 1 || draft.floor > 30) return { ok: false, error: "Этаж от 1 до 30" };
  if (!Number.isFinite(draft.position) || draft.position < 1 || draft.position > 12) return { ok: false, error: "Позиция на этаже от 1 до 12" };
  if (!Number.isFinite(draft.price) || draft.price < 100000) return { ok: false, error: "Укажите цену" };
  if (!STATUSES.includes(draft.status)) return { ok: false, error: "Неизвестный статус" };
  if (!FINISHING.includes(draft.finishing)) return { ok: false, error: "Неизвестная отделка" };
  if (!PLAN_TYPES.includes(draft.planType)) return { ok: false, error: "Неизвестный тип плана" };
  const plan = cleanRooms(draft.plan);
  if (!plan) return { ok: false, error: "В планировке нужны комнаты с шириной и глубиной больше нуля" };
  const sides = draft.windowSides.filter((side) => SIDES.includes(side));
  if (!sides.length) return { ok: false, error: "Отметьте хотя бы одну сторону окон" };
  const title = draft.title.trim();
  if (title.length < 2) return { ok: false, error: "Нужно название, например «2-комнатная»" };

  let saved = id;
  let error = "";
  updateDb((db) => {
    const duplicate = db.apartments.find((item) => item.id === id && item.id !== draft.originalId);
    if (duplicate) {
      error = "Квартира с таким номером уже есть";
      return;
    }
    const previous = draft.originalId ? db.apartments.find((item) => item.id === draft.originalId) : undefined;
    const now = new Date().toISOString();
    const next: Apartment = {
      id,
      floor: Math.round(draft.floor),
      position: Math.round(draft.position),
      rooms: Math.max(0, Math.round(draft.rooms)),
      title,
      area: apartmentArea(plan),
      ceiling: Number.isFinite(draft.ceiling) ? draft.ceiling : 3.05,
      price: Math.round(draft.price),
      status: draft.status,
      reservedUntil: draft.status === "reserved" ? draft.reservedUntil || new Date(Date.now() + 5 * 86400000).toISOString() : null,
      view: draft.view.trim() || "сад",
      finishing: draft.finishing,
      windowSides: sides,
      planType: draft.planType,
      plan,
      features: previous?.features ?? [],
      blurb: draft.blurb.trim(),
      photoUrls: draft.photoUrls.map((url) => url.trim()).filter(Boolean).slice(0, 8),
      internalNote: draft.internalNote.trim(),
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };
    if (previous && previous.price !== next.price) {
      db.events.unshift({
        at: now,
        text: `Цена ${id}: ${previous.price.toLocaleString("ru-RU")} → ${next.price.toLocaleString("ru-RU")} ₽`,
      });
    }
    if (previous && previous.status !== next.status) {
      db.events.unshift({ at: now, text: `Статус ${id}: ${previous.status} → ${next.status}` });
    }
    db.apartments = db.apartments.filter((item) => item.id !== draft.originalId && item.id !== id);
    db.apartments.push(next);
    saved = id;
  });
  if (error) return { ok: false, error };
  return { ok: true, id: saved };
}

export async function deleteApartment(id: string) {
  if (!(await guard())) return { ok: false as const, error: "Нужна авторизация" };
  updateDb((db) => {
    db.apartments = db.apartments.filter((item) => item.id !== id);
    db.events.unshift({ at: new Date().toISOString(), text: `Квартира ${id} удалена из шахматки.` });
  });
  return { ok: true as const };
}

export async function createLead(input: {
  name: string;
  phone: string;
  email: string;
  type: LeadType;
  apartmentId: string;
  message: string;
  time: string;
  company?: string;
}): Promise<{ ok: true; id: string; note: string } | { ok: false; error: string }> {
  if (input.company) return { ok: true, id: "L-0", note: "Заявка принята." };
  const name = input.name.trim();
  const phone = input.phone.trim();
  const digits = phone.replace(/\D/g, "");
  if (name.length < 2) return { ok: false, error: "Как к вам обращаться?" };
  if (digits.length < 10 || digits.length > 15) return { ok: false, error: "Проверьте телефон" };
  if (input.email && !input.email.includes("@")) return { ok: false, error: "Почта выглядит неполной" };
  if (!LEAD_TYPES.includes(input.type)) return { ok: false, error: "Выберите тип заявки" };

  let result: { ok: true; id: string; note: string } | { ok: false; error: string } = { ok: false, error: "Не удалось записать заявку" };
  updateDb((db) => {
    const apartment = input.apartmentId ? db.apartments.find((item) => item.id === input.apartmentId) : undefined;
    if (input.type === "booking" && !apartment) {
      result = { ok: false, error: "Для брони выберите квартиру" };
      return;
    }
    if (input.type === "booking" && apartment?.status === "sold") {
      result = { ok: false, error: "Эта квартира продана. Можно встать в лист ожидания." };
      return;
    }
    let type = input.type;
    let note = "Заявка принята. Перезвоним в рабочие часы, с 10 до 20.";
    if (input.type === "booking" && apartment?.status === "reserved") {
      type = "waitlist";
      note = `Квартира ${apartment.id} уже в брони. Поставили вас в лист ожидания.`;
    }
    const numbers = db.leads.map((lead) => Number(lead.id.replace(/\D/g, ""))).filter((n) => Number.isFinite(n));
    const id = `L-${Math.max(1000, ...numbers) + 1}`;
    const now = new Date().toISOString();
    if (type === "booking" && apartment && apartment.status === "available") {
      const until = addBusinessDays(new Date(), db.settings.bookingDays);
      apartment.status = "reserved";
      apartment.reservedUntil = until.toISOString();
      apartment.updatedAt = now;
      const when = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(until);
      note = `Квартира ${apartment.id} забронирована до ${when}. Цена зафиксирована, депозит ${db.settings.bookingDeposit.toLocaleString("ru-RU")} ₽.`;
      db.events.unshift({ at: now, text: `${name} забронировал ${apartment.id} до ${when}.` });
    }
    db.leads.unshift({
      id,
      createdAt: now,
      name,
      phone,
      email: input.email.trim(),
      type,
      apartmentId: apartment?.id ?? (input.apartmentId || null),
      message: input.message.trim().slice(0, 1000),
      time: input.time,
      status: type === "booking" ? "reserved" : "new",
      managerNote: "",
    });
    result = { ok: true, id, note };
  });
  return result;
}

export async function updateLead(id: string, patch: { status?: LeadStatus; managerNote?: string }) {
  if (!(await guard())) return { ok: false as const, error: "Нужна авторизация" };
  updateDb((db) => {
    const lead = db.leads.find((item) => item.id === id);
    if (!lead) return;
    if (patch.status && LEAD_STATUSES.includes(patch.status)) lead.status = patch.status;
    if (typeof patch.managerNote === "string") lead.managerNote = patch.managerNote.slice(0, 500);
  });
  return { ok: true as const };
}

export async function releaseApartment(id: string) {
  if (!(await guard())) return { ok: false as const, error: "Нужна авторизация" };
  updateDb((db) => {
    const apartment = db.apartments.find((item) => item.id === id);
    if (!apartment) return;
    apartment.status = "available";
    apartment.reservedUntil = null;
    apartment.updatedAt = new Date().toISOString();
    db.events.unshift({ at: apartment.updatedAt, text: `Бронь ${id} снята вручную.` });
  });
  return { ok: true as const };
}

export async function saveSettings(input: Settings) {
  if (!(await guard())) return { ok: false as const, error: "Нужна авторизация" };
  updateDb((db) => {
    db.settings = {
      ...db.settings,
      ...input,
      bookingDeposit: Math.max(0, Math.round(Number(input.bookingDeposit) || 0)),
      bookingDays: Math.min(30, Math.max(1, Math.round(Number(input.bookingDays) || 5))),
      complexName: input.complexName.trim() || db.settings.complexName,
      phone: input.phone.trim(),
      phoneDisplay: input.phoneDisplay.trim(),
      email: input.email.trim(),
    };
  });
  return { ok: true as const };
}

export async function markFeed(target: FeedTarget) {
  if (!(await guard())) return { ok: false as const, error: "Нужна авторизация" };
  const labels: Record<FeedTarget, string> = {
    avito: "Авито",
    yandex: "Яндекс Недвижимость",
    cian: "Циан",
    domclick: "Домклик",
  };
  updateDb((db) => {
    const count = db.apartments.filter((item) => item.status === "available" || (item.status === "reserved" && db.settings.exportReserved)).length;
    db.feedLog.unshift({
      id: `F-${Date.now()}`,
      at: new Date().toISOString(),
      target,
      count,
      note: `Ссылку на фид передали в кабинет ${labels[target]}`,
    });
    db.feedLog = db.feedLog.slice(0, 30);
    db.events.unshift({ at: new Date().toISOString(), text: `Отмечена передача фида: ${labels[target]}.` });
  });
  return { ok: true as const };
}

export async function recordPull(target: "pull-avito" | "pull-yandex", count: number) {
  const db = readDb();
  const last = db.feedLog[0];
  const fresh = last && last.target === target && Date.now() - Date.parse(last.at) < 10 * 60 * 1000;
  if (fresh) return;
  updateDb((state) => {
    state.feedLog.unshift({
      id: `F-${Date.now()}`,
      at: new Date().toISOString(),
      target,
      count,
      note: "Площадка забрала фид по ссылке",
    });
    state.feedLog = state.feedLog.slice(0, 30);
  });
}

export async function resetDemo() {
  if (!(await guard())) return { ok: false as const, error: "Нужна авторизация" };
  resetDb();
  return { ok: true as const };
}
