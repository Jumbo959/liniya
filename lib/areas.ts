import type { PlanRoom } from "./types";

export function roomArea(room: PlanRoom) {
  return Math.round(room.w * room.d * 10) / 10;
}

export function apartmentArea(rooms: PlanRoom[]) {
  const sum = rooms
    .filter((room) => room.kind !== "balcony")
    .reduce((total, room) => total + room.w * room.d, 0);
  return Math.round(sum * 10) / 10;
}

export function kitchenArea(rooms: PlanRoom[]) {
  const kitchen = rooms
    .filter((room) => room.kind === "kitchen")
    .reduce((total, room) => total + room.w * room.d, 0);
  if (kitchen > 0) return Math.round(kitchen * 10) / 10;
  const living = rooms.find((room) => room.kind === "living");
  if (!living) return 0;
  return Math.round(living.w * living.d * 0.34 * 10) / 10;
}

export function livingArea(rooms: PlanRoom[]) {
  const sum = rooms
    .filter((room) => room.kind === "living" || room.kind === "bedroom")
    .reduce((total, room) => total + room.w * room.d, 0);
  return Math.round(sum * 10) / 10;
}

export function boundsOf(rooms: PlanRoom[]) {
  const source = rooms.length ? rooms : [{ x: 0, y: 0, w: 1, d: 1, name: "", kind: "hall" as const }];
  const minX = Math.min(...source.map((room) => room.x));
  const minY = Math.min(...source.map((room) => room.y));
  const maxX = Math.max(...source.map((room) => room.x + room.w));
  const maxY = Math.max(...source.map((room) => room.y + room.d));
  return { minX, minY, maxX, maxY, w: maxX - minX, d: maxY - minY };
}

export function assertNoOverlap(label: string, rooms: PlanRoom[]) {
  const solids = rooms.filter((room) => room.kind !== "balcony");
  for (let i = 0; i < solids.length; i++) {
    for (let j = i + 1; j < solids.length; j++) {
      const a = solids[i];
      const b = solids[j];
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.d, b.y + b.d) - Math.max(a.y, b.y);
      if (ox > 0.05 && oy > 0.05) {
        throw new Error(`План «${label}»: пересекаются «${a.name}» и «${b.name}»`);
      }
    }
  }
}
