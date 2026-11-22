"use client";

import { useState } from "react";
import { formatArea, formatRent, roomsShort } from "@/lib/format";
import type { PublicApartment } from "@/lib/types";

export function Facade({ apartments }: { apartments: PublicApartment[] }) {
  const [hover, setHover] = useState<PublicApartment | null>(null);
  const floors = [...new Set(apartments.map((item) => item.floor))].sort((a, b) => b - a);
  const positions = [...new Set(apartments.map((item) => item.position))].sort((a, b) => a - b);
  const byKey = new Map(apartments.map((item) => [`${item.floor}-${item.position}`, item]));
  const floorH = 54;
  const lobby = 34;
  const top = 36;
  const left = 78;
  const width = 860;
  const bay = width / positions.length;
  const height = top + floors.length * floorH + lobby + 70;

  const caption = hover
    ? `${hover.id} · ${roomsShort(hover.rooms)} · ${formatArea(hover.area)} · ${hover.status === "sold" ? "занята" : formatRent(hover.price)}`
    : "Наведите на окно — это конкретная квартира";

  return (
    <div className="facade-wrap">
      <svg viewBox={`0 0 1000 ${height}`} role="img" aria-label="Фасад дома, окна ведут в карточки квартир">
        <rect x={left - 18} y={top - 16} width={width + 36} height={floors.length * floorH + lobby + 28} fill="#5e342c" />
        {floors.map((floor, index) => {
          const y = top + index * floorH;
          return (
            <g key={floor}>
              <line x1={left} x2={left + width} y1={y} y2={y} stroke="rgba(246,236,220,0.18)" />
              <text x={left - 28} y={y + 32} textAnchor="end" fill="#1b1916" fontSize="16" fontFamily="Georgia, serif">
                {floor}
              </text>
              {positions.map((position, bayIndex) => {
                const apt = byKey.get(`${floor}-${position}`);
                if (!apt) return null;
                const x = left + bayIndex * bay;
                const glass = apt.status === "sold" ? "#2a211f" : apt.status === "reserved" ? "#c9846a" : "#f4e6cf";
                const wins = apt.rooms <= 0 ? 2 : apt.rooms >= 3 ? 4 : 3;
                return (
                  <a key={apt.id} href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/apartments/${apt.id}`} aria-label={`Квартира ${apt.id}`} onMouseEnter={() => setHover(apt)} onMouseLeave={() => setHover(null)}>
                    {Array.from({ length: wins }).map((_, win) => {
                      const gap = bay / (wins + 1);
                      return <rect key={win} x={x + gap * (win + 0.35)} y={y + 12} width={Math.min(28, gap * 0.7)} height={28} fill={glass} />;
                    })}
                  </a>
                );
              })}
            </g>
          );
        })}
        <text x={left} y={top + floors.length * floorH + lobby - 8} fill="#f6f3ec" fontSize="13" letterSpacing="1.5">
          ЛОББИ
        </text>
        <rect x={left - 30} y={top + floors.length * floorH + lobby + 8} width={width + 70} height={16} fill="#24312b" />
        <ellipse cx={left + 40} cy={top + floors.length * floorH + lobby + 8} rx="26" ry="10" fill="#1c2a24" />
        <ellipse cx={left + width - 20} cy={top + floors.length * floorH + lobby + 6} rx="34" ry="12" fill="#1c2a24" />
      </svg>
      <p className="facade-caption">
        <b>{caption}</b>
      </p>
    </div>
  );
}
