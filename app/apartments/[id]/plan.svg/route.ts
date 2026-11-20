import { renderPlanSvg } from "@/lib/planSvg";
import { getApartment } from "@/lib/store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const apartment = getApartment(id);
  if (!apartment) return new Response("Нет такой квартиры", { status: 404 });
  return new Response(renderPlanSvg(apartment.plan), {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "no-store" },
  });
}
