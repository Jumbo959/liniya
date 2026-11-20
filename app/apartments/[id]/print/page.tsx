import { FloorPlan } from "@/components/FloorPlan";
import { roomArea } from "@/lib/areas";
import { formatArea, formatPrice, roomsLong } from "@/lib/format";
import { getApartment, getPublicApartments } from "@/lib/store";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getPublicApartments().map((item) => ({ id: item.id }));
}

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apartment = getApartment(id);
  if (!apartment) notFound();
  return (
    <article className="wrap apartment">
      <div>
        <p className="kicker">ЖК «Линия» · карточка для встречи</p>
        <h1>№ {apartment.id}</h1>
        <FloorPlan rooms={apartment.plan} />
      </div>
      <aside>
        <p>{roomsLong(apartment.rooms)} · {formatArea(apartment.area)} · {apartment.floor} этаж</p>
        <p className="price-lg">{apartment.status === "sold" ? "Продана" : formatPrice(apartment.price)}</p>
        <p>{apartment.view} · {apartment.finishing} · потолок {apartment.ceiling} м</p>
        <p>{apartment.blurb}</p>
        <table>
          <tbody>
            {apartment.plan.map((room) => (
              <tr key={room.name + room.x}>
                <td>{room.name}</td>
                <td>{roomArea(room).toLocaleString("ru-RU")} м²</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted no-print">Ctrl+P — карточка печатается без шапки.</p>
      </aside>
    </article>
  );
}
