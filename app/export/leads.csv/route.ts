import { cookies } from "next/headers";
import { COOKIE, isAuthed } from "@/lib/auth";
import { csvCell } from "@/lib/format";
import { readDb } from "@/lib/store";

export async function GET() {
  const jar = await cookies();
  if (!isAuthed(jar.get(COOKIE)?.value)) return new Response("Нужна авторизация", { status: 401 });
  const rows = [
    ["id", "createdAt", "name", "phone", "email", "type", "apartment", "status", "message", "note"].join(","),
    ...readDb().leads.map((lead) =>
      [lead.id, lead.createdAt, lead.name, lead.phone, lead.email, lead.type, lead.apartmentId ?? "", lead.status, lead.message, lead.managerNote]
        .map(csvCell)
        .join(","),
    ),
  ];
  return new Response(`\uFEFF${rows.join("\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=liniya-leads.csv",
    },
  });
}
