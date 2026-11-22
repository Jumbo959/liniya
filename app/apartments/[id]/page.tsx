import Link from "next/link";
import { notFound } from "next/navigation";
import { ApartmentStudio } from "@/components/ApartmentStudio";
import { BookingForm } from "@/components/BookingForm";
import { MortgageCalc } from "@/components/MortgageCalc";
import { SaveButtons } from "@/components/SaveButtons";
import { StatusMark } from "@/components/StatusMark";
import { formatArea, formatDate, formatRent, roomsLong } from "@/lib/format";
import { kitchenArea, livingArea } from "@/lib/areas";
import { getApartment, getPublicApartments, toPublic } from "@/lib/store";

export function generateStaticParams() {
  return getPublicApartments().map((item) => ({ id: item.id }));
}

export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return params.then(async ({ id }) => {
    const apartment = getApartment(id);
    return { title: apartment ? `Квартира ${apartment.id}` : "Квартира" };
  });
}

export default async function ApartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const full = getApartment(id);
  if (!full) notFound();
  const apartment = toPublic(full);
  const mates = getPublicApartments().filter((item) => item.floor === apartment.floor);
  const similar = getPublicApartments()
    .filter((item) => item.id !== apartment.id && item.rooms === apartment.rooms && item.status !== "sold")
    .slice(0, 3);

  return (
    <article className="wrap-wide apartment">
      <div>
        <p className="kicker"><Link href="/catalog">Квартиры</Link> / № {apartment.id}</p>
        <ApartmentStudio apartment={apartment} />
      </div>
      <aside className="side-card">
        <StatusMark status={apartment.status} />
        <h1>№ {apartment.id}</h1>
        <p className="price-lg">{apartment.status === "sold" ? "Занята" : formatRent(apartment.price)}</p>
        <p className="meta-line">
          <span>{roomsLong(apartment.rooms)}</span>
          <span>{formatArea(apartment.area)}</span>
          <span>{apartment.floor} этаж из 9</span>
          <span>с мебелью</span>
        </p>
        {apartment.reservedUntil && apartment.status === "reserved" && (
          <p>Смотрят до {formatDate(apartment.reservedUntil)}. Можно встать в лист ожидания.</p>
        )}
        <p className="blurb">{apartment.blurb}</p>
        <ul className="feature-list">
          {apartment.features.map((item) => <li key={item}>{item}</li>)}
          <li>кухня {kitchenArea(apartment.plan).toLocaleString("ru-RU")} м²</li>
          <li>жилая {livingArea(apartment.plan).toLocaleString("ru-RU")} м²</li>
          <li>потолок {apartment.ceiling.toLocaleString("ru-RU")} м</li>
        </ul>
        <div>
          <p className="label">На этом этаже</p>
          <div className="floor-mates">
            {mates.map((item) =>
              item.id === apartment.id ? (
                <span className="here" key={item.id}>{item.id}</span>
              ) : (
                <Link key={item.id} href={`/apartments/${item.id}`}>{item.id}</Link>
              ),
            )}
          </div>
        </div>
        <SaveButtons id={apartment.id} />
        {apartment.status !== "sold" && <MortgageCalc price={apartment.price} />}
        <BookingForm apartmentId={apartment.id} status={apartment.status} />
        {similar.length > 0 && (
          <p className="muted">
            Рядом по метражу: {similar.map((item, index) => (
              <span key={item.id}>{index ? ", " : ""}<Link href={`/apartments/${item.id}`}>{item.id}</Link></span>
            ))}
          </p>
        )}
      </aside>
    </article>
  );
}
