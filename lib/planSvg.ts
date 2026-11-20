import { boundsOf, roomArea } from "./areas";
import type { PlanRoom, RoomKind } from "./types";

const FILL: Record<RoomKind, string> = {
  living: "#f3eadc",
  bedroom: "#e7f0e8",
  kitchen: "#f7f3ea",
  bath: "#e4e8e6",
  hall: "#efe8dc",
  wardrobe: "#e8e2d6",
  balcony: "#f8f6f1",
};

export function renderPlanSvg(rooms: PlanRoom[]) {
  const box = boundsOf(rooms);
  const pad = 0.7;
  const width = box.w + pad * 2;
  const height = box.d + pad * 2;
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.minX - pad} ${box.minY - pad} ${width} ${height}" width="1200" height="${Math.round(1200 * (height / width))}">`,
  );
  parts.push(`<rect x="${box.minX - pad}" y="${box.minY - pad}" width="${width}" height="${height}" fill="#f7f4ee"/>`);
  for (const room of rooms) {
    const dash = room.kind === "balcony" ? `stroke-dasharray="0.08 0.06"` : "";
    parts.push(
      `<rect x="${room.x}" y="${room.y}" width="${room.w}" height="${room.d}" fill="${FILL[room.kind]}" stroke="#1c1916" stroke-width="0.035" ${dash}/>`,
    );
    parts.push(
      `<text x="${room.x + room.w / 2}" y="${room.y + room.d / 2}" text-anchor="middle" font-family="Georgia, serif" font-size="0.22" fill="#1c1916">${room.name}</text>`,
    );
    parts.push(
      `<text x="${room.x + room.w / 2}" y="${room.y + room.d / 2 + 0.28}" text-anchor="middle" font-family="Arial, sans-serif" font-size="0.16" fill="#6f675e">${roomArea(room).toLocaleString("ru-RU")} м²</text>`,
    );
  }
  parts.push(`</svg>`);
  return parts.join("");
}
