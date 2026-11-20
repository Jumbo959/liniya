import fs from "fs";
import path from "path";
import { apartmentArea } from "./areas";
import { createSeed } from "./seed";
import type { Apartment, Database, PublicApartment } from "./types";

const file = path.join(process.cwd(), "data", "db.json");

function releaseExpired(db: Database) {
  const now = Date.now();
  for (const apartment of db.apartments) {
    if (apartment.status !== "reserved" || !apartment.reservedUntil) continue;
    if (Date.parse(apartment.reservedUntil) > now) continue;
    apartment.status = "available";
    apartment.reservedUntil = null;
    apartment.updatedAt = new Date().toISOString();
    db.events.unshift({
      at: apartment.updatedAt,
      text: `Бронь ${apartment.id} истекла и снята автоматически.`,
    });
  }
  db.events = db.events.slice(0, 40);
}

function write(db: Database) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tmp, file);
}

export function readDb(): Database {
  if (!fs.existsSync(file)) {
    const seed = createSeed();
    write(seed);
  }
  const db = JSON.parse(fs.readFileSync(file, "utf8")) as Database;
  const before = JSON.stringify(db.apartments.map((item) => [item.id, item.status, item.reservedUntil]));
  releaseExpired(db);
  const after = JSON.stringify(db.apartments.map((item) => [item.id, item.status, item.reservedUntil]));
  if (before !== after) write(db);
  return db;
}

export function updateDb<T>(fn: (db: Database) => T): T {
  const db = readDb();
  const result = fn(db);
  write(db);
  return result;
}

export function resetDb() {
  if (fs.existsSync(file)) fs.unlinkSync(file);
  return readDb();
}

export function sortApartments(list: Apartment[]) {
  return [...list].sort((a, b) => a.floor - b.floor || a.position - b.position || a.id.localeCompare(b.id, "ru"));
}

export function toPublic(apartment: Apartment): PublicApartment {
  const copy = { ...apartment } as Partial<Apartment>;
  delete copy.internalNote;
  return copy as PublicApartment;
}

export function getApartments() {
  return sortApartments(readDb().apartments);
}

export function getPublicApartments() {
  return getApartments().map(toPublic);
}

export function getApartment(id: string) {
  return readDb().apartments.find((item) => item.id === id) ?? null;
}

export function withArea<T extends { plan: Apartment["plan"]; area: number }>(apartment: T) {
  apartment.area = apartmentArea(apartment.plan);
  return apartment;
}
