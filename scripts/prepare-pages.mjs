import fs from "fs";
import path from "path";

const root = process.cwd();
const remove = ["app/admin", "app/feed", "app/export", "app/api", "app/apartments/[id]/plan.svg"];
for (const item of remove) fs.rmSync(path.join(root, item), { recursive: true, force: true });

const store = `import { createSeed } from "./seed";
import type { Apartment, Database, PublicApartment } from "./types";

const db = createSeed();

export function sortApartments(list: Apartment[]) {
  return [...list].sort((a, b) => a.floor - b.floor || a.position - b.position || a.id.localeCompare(b.id, "ru"));
}

export function toPublic(apartment: Apartment): PublicApartment {
  const copy = { ...apartment } as Partial<Apartment>;
  delete copy.internalNote;
  return copy as PublicApartment;
}

export function readDb(): Database {
  return db;
}

export function updateDb<T>(fn: (data: Database) => T): T {
  return fn(db);
}

export function resetDb() {
  return db;
}

export function getApartments() {
  return sortApartments(db.apartments);
}

export function getPublicApartments() {
  return getApartments().map(toPublic);
}

export function getApartment(id: string) {
  return db.apartments.find((item) => item.id === id) ?? null;
}

export function withArea<T extends { plan: Apartment["plan"]; area: number }>(apartment: T) {
  return apartment;
}
`;

fs.writeFileSync(path.join(root, "lib/store.ts"), store);
console.log("public build: admin and server routes removed");
