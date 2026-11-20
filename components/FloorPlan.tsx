"use client";

import { boundsOf, roomArea } from "@/lib/areas";
import type { PlanRoom, RoomKind } from "@/lib/types";

const FILL: Record<RoomKind, string> = {
  living: "#f3eadc",
  bedroom: "#e7f0e8",
  kitchen: "#f7f3ea",
  bath: "#e4e8e6",
  hall: "#efe8dc",
  wardrobe: "#e8e2d6",
  balcony: "#f8f6f1",
};

export function FloorPlan({
  rooms,
  selected = null,
  onSelect,
  compact = false,
}: {
  rooms: PlanRoom[];
  selected?: number | null;
  onSelect?: (index: number) => void;
  compact?: boolean;
}) {
  const box = boundsOf(rooms);
  const solids = rooms.filter((room) => room.kind !== "balcony");
  const solidBox = boundsOf(solids.length ? solids : rooms);
  const pad = compact ? 0.35 : 1.35;
  const view = `${box.minX - pad} ${box.minY - pad} ${box.w + pad * 2} ${box.d + pad * 2}`;

  return (
    <svg className={compact ? "" : "plan-svg"} viewBox={view} role="img" aria-label="Планировка квартиры">
      <rect x={box.minX - pad} y={box.minY - pad} width={box.w + pad * 2} height={box.d + pad * 2} fill="#f7f4ee" />
      {rooms.map((room, index) => {
        const active = selected === index;
        return (
          <g key={`${room.name}-${index}`} onClick={() => onSelect?.(index)} style={{ cursor: onSelect ? "pointer" : "default" }}>
            <rect
              x={room.x}
              y={room.y}
              width={room.w}
              height={room.d}
              fill={active ? "#f0d2c8" : FILL[room.kind]}
              stroke={active ? "#9c4032" : "#1c1916"}
              strokeWidth={active ? 0.07 : 0.035}
              strokeDasharray={room.kind === "balcony" ? "0.08 0.07" : undefined}
            />
            {!compact && room.w > 1.3 && room.d > 1.1 && (
              <>
                <text x={room.x + room.w / 2} y={room.y + room.d / 2} textAnchor="middle" fontSize="0.2" fill="#1c1916" fontFamily="Georgia, serif">
                  {room.name}
                </text>
                <text x={room.x + room.w / 2} y={room.y + room.d / 2 + 0.28} textAnchor="middle" fontSize="0.15" fill="#6f675e">
                  {roomArea(room).toLocaleString("ru-RU")} м²
                </text>
              </>
            )}
          </g>
        );
      })}
      {!compact && (
        <>
          <text x={(solidBox.minX + solidBox.maxX) / 2} y={box.minY - 0.55} textAnchor="middle" fontSize="0.2" fill="#6f675e">
            сад · {solidBox.w.toFixed(1)} м
          </text>
          <text x={solidBox.maxX + 0.15} y={(solidBox.minY + solidBox.maxY) / 2} fontSize="0.18" fill="#6f675e">
            {solidBox.d.toFixed(1)} м
          </text>
          <text x={solidBox.minX} y={solidBox.maxY + 0.45} fontSize="0.18" fill="#6f675e">
            галерея
          </text>
          <text x={box.maxX - 0.2} y={box.minY + 0.15} textAnchor="end" fontSize="0.2" fill="#1c1916">
            С
          </text>
        </>
      )}
    </svg>
  );
}
