import type { PlanRoom, WindowSide } from "./types";

export type Block = {
  cx: number;
  cy: number;
  cz: number;
  sx: number;
  sy: number;
  sz: number;
  color: string;
  opacity: number;
  room: number;
  kind: "floor" | "wall" | "glass" | "furniture";
};

const FLOOR: Record<PlanRoom["kind"], string> = {
  living: "#c6a07c",
  bedroom: "#b48968",
  kitchen: "#d9d3c6",
  bath: "#c5cbc7",
  hall: "#b9a48c",
  wardrobe: "#b9a48c",
  balcony: "#d2c8b8",
};

type Edge = {
  axis: "h" | "v";
  fixed: number;
  from: number;
  to: number;
  room: number;
  side: WindowSide;
};

type Span = { from: number; to: number; touch: "room" | "balcony" };

function near(a: number, b: number) {
  return Math.abs(a - b) < 0.08;
}

function interiorBounds(rooms: PlanRoom[]) {
  const solids = rooms.filter((room) => room.kind !== "balcony");
  const source = solids.length ? solids : rooms;
  const minX = Math.min(...source.map((room) => room.x));
  const minY = Math.min(...source.map((room) => room.y));
  const maxX = Math.max(...source.map((room) => room.x + room.w));
  const maxY = Math.max(...source.map((room) => room.y + room.d));
  return { minX, minY, maxX, maxY, w: maxX - minX, d: maxY - minY };
}

function overlaps(a0: number, a1: number, b0: number, b1: number) {
  const from = Math.max(a0, b0);
  const to = Math.min(a1, b1);
  if (to - from > 0.08) return { from, to };
  return null;
}

function touches(edge: Edge, other: PlanRoom): Span | null {
  if (edge.axis === "h") {
    const otherEdge = edge.side === "north" ? other.y + other.d : other.y;
    if (!near(otherEdge, edge.fixed)) return null;
    const span = overlaps(edge.from, edge.to, other.x, other.x + other.w);
    if (!span) return null;
    return { ...span, touch: other.kind === "balcony" ? "balcony" : "room" };
  }
  const otherEdge = edge.side === "west" ? other.x + other.w : other.x;
  if (!near(otherEdge, edge.fixed)) return null;
  const span = overlaps(edge.from, edge.to, other.y, other.y + other.d);
  if (!span) return null;
  return { ...span, touch: other.kind === "balcony" ? "balcony" : "room" };
}

function onFacade(edge: Edge, box: ReturnType<typeof interiorBounds>) {
  if (edge.side === "north") return near(edge.fixed, box.minY);
  if (edge.side === "south") return near(edge.fixed, box.maxY);
  if (edge.side === "west") return near(edge.fixed, box.minX);
  return near(edge.fixed, box.maxX);
}

function pushBox(
  blocks: Block[],
  edge: Edge,
  from: number,
  to: number,
  height: number,
  y0: number,
  color: string,
  opacity: number,
  kind: Block["kind"],
) {
  const length = to - from;
  if (length < 0.08 || height < 0.05) return;
  const thick = kind === "glass" ? 0.04 : 0.1;
  if (edge.axis === "h") {
    blocks.push({
      cx: (from + to) / 2,
      cy: y0 + height / 2,
      cz: edge.fixed,
      sx: length,
      sy: height,
      sz: thick,
      color,
      opacity,
      room: edge.room,
      kind,
    });
  } else {
    blocks.push({
      cx: edge.fixed,
      cy: y0 + height / 2,
      cz: (from + to) / 2,
      sx: thick,
      sy: height,
      sz: length,
      color,
      opacity,
      room: edge.room,
      kind,
    });
  }
}

function splitOpening(from: number, to: number, opening: number) {
  const length = to - from;
  const width = Math.min(opening, length - 0.4);
  if (width < 0.45) {
    return { parts: [[from, to] as [number, number]], hole: null as [number, number] | null };
  }
  const mid = (from + to) / 2;
  const h0 = mid - width / 2;
  const h1 = mid + width / 2;
  const parts: [number, number][] = [];
  if (h0 - from > 0.06) parts.push([from, h0]);
  if (to - h1 > 0.06) parts.push([h1, to]);
  return { parts, hole: [h0, h1] as [number, number] };
}

export function buildBlocks(rooms: PlanRoom[], windowSides: WindowSide[], ceiling: number): Block[] {
  const blocks: Block[] = [];
  const box = interiorBounds(rooms);
  const wallColor = "#e6e0d4";
  const seen = new Set<string>();

  rooms.forEach((room, index) => {
    blocks.push({
      cx: room.x + room.w / 2,
      cy: room.kind === "balcony" ? 0.035 : 0.05,
      cz: room.y + room.d / 2,
      sx: Math.max(0.2, room.w - 0.02),
      sy: room.kind === "balcony" ? 0.06 : 0.1,
      sz: Math.max(0.2, room.d - 0.02),
      color: FLOOR[room.kind],
      opacity: 1,
      room: index,
      kind: "floor",
    });
  });

  const solids = rooms
    .map((room, index) => ({ room, index }))
    .filter((item) => item.room.kind !== "balcony");

  for (const { room, index } of solids) {
    const edges: Edge[] = [
      { axis: "h", fixed: room.y, from: room.x, to: room.x + room.w, room: index, side: "north" },
      { axis: "h", fixed: room.y + room.d, from: room.x, to: room.x + room.w, room: index, side: "south" },
      { axis: "v", fixed: room.x, from: room.y, to: room.y + room.d, room: index, side: "west" },
      { axis: "v", fixed: room.x + room.w, from: room.y, to: room.y + room.d, room: index, side: "east" },
    ];

    for (const edge of edges) {
      const spans: Span[] = [];
      rooms.forEach((other, otherIndex) => {
        if (otherIndex === index) return;
        const span = touches(edge, other);
        if (span) spans.push(span);
      });

      const ordered = spans.map((span) => [span.from, span.to] as [number, number]).sort((a, b) => a[0] - b[0]);
      const exposed: Array<[number, number]> = [];
      let cursor = edge.from;
      for (const [start, end] of ordered) {
        if (start > cursor + 0.05) exposed.push([cursor, Math.min(start, edge.to)]);
        cursor = Math.max(cursor, end);
      }
      if (edge.to > cursor + 0.05) exposed.push([cursor, edge.to]);

      for (const span of spans) {
        const key = `${edge.axis}:${edge.fixed.toFixed(2)}:${span.from.toFixed(2)}:${span.to.toFixed(2)}`;
        if (span.touch === "room") {
          if (seen.has(key)) continue;
          seen.add(key);
          const opening = splitOpening(span.from, span.to, 0.86);
          for (const [a, b] of opening.parts) pushBox(blocks, edge, a, b, 1.05, 0.1, wallColor, 1, "wall");
        } else {
          pushBox(blocks, edge, span.from, span.to, 2.15, 0.1, "#d5e3e6", 0.28, "glass");
        }
      }

      const facade = onFacade(edge, box);
      const glassy =
        facade &&
        windowSides.includes(edge.side) &&
        room.kind !== "bath" &&
        room.kind !== "wardrobe" &&
        room.kind !== "hall";
      const entrance = room.kind === "hall" && edge.side === "south";

      for (const [start, end] of exposed) {
        if (glassy) {
          const opening = splitOpening(start, end, Math.min(1.8, (end - start) * 0.62));
          for (const [a, b] of opening.parts) pushBox(blocks, edge, a, b, ceiling - 0.1, 0.1, wallColor, 1, "wall");
          if (opening.hole) {
            const [a, b] = opening.hole;
            pushBox(blocks, edge, a, b, 0.42, 0.1, wallColor, 1, "wall");
            pushBox(blocks, edge, a, b, Math.max(0.25, ceiling - 2.3), 2.2, wallColor, 1, "wall");
            pushBox(blocks, edge, a, b, 1.65, 0.5, "#d5e3e6", 0.33, "glass");
          }
        } else if (entrance) {
          const opening = splitOpening(start, end, 0.9);
          for (const [a, b] of opening.parts) pushBox(blocks, edge, a, b, ceiling - 0.1, 0.1, "#ddd6ca", 1, "wall");
          if (opening.hole) {
            pushBox(blocks, edge, opening.hole[0], opening.hole[1], Math.max(0.2, ceiling - 2.25), 2.15, "#ddd6ca", 1, "wall");
          }
        } else {
          pushBox(blocks, edge, start, end, ceiling - 0.1, 0.1, "#ddd6ca", 1, "wall");
        }
      }
    }
  }

  rooms.forEach((room, index) => {
    if (room.kind !== "balcony") return;
    const edges: Edge[] = [
      { axis: "h", fixed: room.y, from: room.x, to: room.x + room.w, room: index, side: "north" },
      { axis: "h", fixed: room.y + room.d, from: room.x, to: room.x + room.w, room: index, side: "south" },
      { axis: "v", fixed: room.x, from: room.y, to: room.y + room.d, room: index, side: "west" },
      { axis: "v", fixed: room.x + room.w, from: room.y, to: room.y + room.d, room: index, side: "east" },
    ];
    for (const edge of edges) {
      const hitsSolid = rooms.some((other) => other.kind !== "balcony" && touches(edge, other));
      if (hitsSolid) continue;
      pushBox(blocks, edge, edge.from, edge.to, 1.05, 0.08, "#d7e4e6", 0.38, "glass");
    }
  });

  rooms.forEach((room, index) => {
    if (room.kind === "bedroom" && room.w > 2.2 && room.d > 2.4) {
      blocks.push({
        cx: room.x + room.w / 2,
        cy: 0.32,
        cz: room.y + Math.min(1.35, room.d * 0.38),
        sx: Math.min(1.7, room.w - 0.5),
        sy: 0.38,
        sz: Math.min(2.05, room.d - 0.8),
        color: "#efe8dc",
        opacity: 1,
        room: index,
        kind: "furniture",
      });
    }
    if ((room.kind === "living" || room.kind === "kitchen") && room.w > 2 && room.d > 2) {
      blocks.push({
        cx: room.x + room.w / 2,
        cy: 0.55,
        cz: room.y + room.d - 0.42,
        sx: Math.max(0.8, room.w - 0.5),
        sy: 0.86,
        sz: 0.55,
        color: room.kind === "kitchen" ? "#f4f1ea" : "#8d9a90",
        opacity: 1,
        room: index,
        kind: "furniture",
      });
    }
    if (room.kind === "living" && room.w > 3) {
      blocks.push({
        cx: room.x + Math.min(1.3, room.w * 0.3),
        cy: 0.38,
        cz: room.y + room.d * 0.45,
        sx: 0.9,
        sy: 0.48,
        sz: Math.min(2.1, room.d * 0.42),
        color: "#6e7680",
        opacity: 1,
        room: index,
        kind: "furniture",
      });
    }
  });

  return blocks;
}

export function modelCenter(rooms: PlanRoom[]) {
  const box = interiorBounds(rooms);
  return { x: (box.minX + box.maxX) / 2, z: (box.minY + box.maxY) / 2, w: box.w, d: box.d };
}
