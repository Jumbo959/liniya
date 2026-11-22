import { BookingForm } from "@/components/BookingForm";
import { getPublicApartments, readDb } from "@/lib/store";

export const metadata = { title: "Контакты" };

export default function ContactsPage() {
  const { settings } = readDb();
  const choices = getPublicApartments()
    .filter((item) => item.status !== "sold")
    .map((item) => ({ id: item.id, label: `${item.id} · ${item.title} · ${item.floor} этаж` }));

  return (
    <section className="wrap page-hero">
      <p className="kicker">контакты</p>
      <h1>Напишите или приезжайте смотреть.</h1>
      <div className="contact-grid" style={{ marginTop: 28 }}>
        <div>
          <p>{settings.city}, {settings.district}, {settings.address}</p>
          <p>Ежедневно 10:00–20:00. {settings.salesName} показывает квартиры на втором этаже.</p>
          <p><a href={`tel:${settings.phone}`}>{settings.phoneDisplay}</a></p>
          <p><a href={`mailto:${settings.email}`}>{settings.email}</a></p>
          <p className="muted">12 минут пешком до метро «Тульская». Машину оставляйте на гостевых местах у переулка, во двор не заезжаем.</p>
          <svg className="map" viewBox="0 0 640 360" role="img" aria-label="Схема: дом вдоль переулка, сад с севера">
            <rect width="640" height="360" fill="#f6f3ec" />
            <path d="M40 250 H600" stroke="#1b1916" strokeWidth="8" />
            <text x="48" y="242" fontSize="13" fill="#6f675e">переулок</text>
            <rect x="90" y="150" width="420" height="46" fill="#6d3228" />
            <text x="110" y="178" fill="#f6f3ec" fontSize="16">дом «Линия»</text>
            <rect x="90" y="40" width="420" height="90" fill="#24312b" />
            <text x="110" y="90" fill="#f6f3ec" fontSize="16">сад</text>
            <circle cx="560" cy="270" r="18" fill="none" stroke="#9c4032" />
            <text x="548" y="274" fontSize="12" fill="#9c4032">М</text>
          </svg>
        </div>
        <BookingForm choices={choices} />
      </div>
    </section>
  );
}
