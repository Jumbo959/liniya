import Link from "next/link";
import { formatArea, roomsShort } from "@/lib/format";
import type { PublicApartment } from "@/lib/types";

export function Chessboard({
  apartments,
  active,
  compact = false,
}: {
  apartments: PublicApartment[];
  active?: string[];
  compact?: boolean;
}) {
  const floors = [...new Set(apartments.map((item) => item.floor))].sort((a, b) => b - a);
  const positions = [...new Set(apartments.map((item) => item.position))].sort((a, b) => a - b);
  const activeSet = active ? new Set(active) : null;

  return (
    <div className={compact ? "chess compact" : "chess"} style={{ ["--cols" as string]: positions.length }}>
      {floors.map((floor) => (
        <div className="chess-row" key={floor}>
          <div className="floor-label">{floor}</div>
          {positions.map((position) => {
            const apt = apartments.find((item) => item.floor === floor && item.position === position);
            if (!apt) return <div key={position} />;
            const dim = activeSet && !activeSet.has(apt.id);
            return (
              <Link key={apt.id} href={`/apartments/${apt.id}`} className={`is-${apt.status}${dim ? " is-dim" : ""}`}>
                <span className="num">{apt.id}</span>
                <span className="sub">
                  {roomsShort(apt.rooms)} · {formatArea(apt.area)}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
