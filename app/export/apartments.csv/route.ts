import { cookies } from "next/headers";
import { COOKIE, isAuthed } from "@/lib/auth";
import { csvCell } from "@/lib/format";
import { getApartments } from "@/lib/store";

export async function GET() {
  const jar = await cookies();
  if (!isAuthed(jar.get(COOKIE)?.value)) return new Response("Нужна авторизация", { status: 401 });
  const rows = [
    ["id", "floor", "position", "rooms", "area", "price", "status", "finishing", "view", "ceiling"].join(","),
    ...getApartments().map((item) =>
      [item.id, item.floor, item.position, item.rooms, item.area, item.price, item.status, item.finishing, item.view, item.ceiling]
        .map(csvCell)
        .join(","),
    ),
  ];
  return new Response(`\uFEFF${rows.join("\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=liniya-apartments.csv",
    },
  });
}
