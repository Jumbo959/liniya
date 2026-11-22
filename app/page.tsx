import Link from "next/link";
import { Chessboard } from "@/components/Chessboard";
import { FloorPlan } from "@/components/FloorPlan";
import { HomePreview } from "@/components/HomePreview";
import { StatusMark } from "@/components/StatusMark";
import { HOUSE_FACTS, INCLUDED, RENT_STEPS } from "@/lib/content";
import { formatArea, formatRent, roomsLong } from "@/lib/format";
import { getPublicApartments } from "@/lib/store";

export default function HomePage() {
  const apartments = getPublicApartments();
  const available = apartments.filter((item) => item.status === "available");
  const min = available.reduce((acc, item) => Math.min(acc, item.price), Number.POSITIVE_INFINITY);
  const featured = [0, 1, 2, 3]
    .map((rooms) => available.find((item) => item.rooms === rooms))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const preview = available.find((item) => item.id === "505") || available.find((item) => item.rooms === 3) || available[0];

  return (
    <>
      <section className="wrap-wide hero">
        <div className="hero-copy">
          <p className="kicker">Даниловский район · Ленточная, 8</p>
          <h1>Квартиры в аренду, с мебелью.</h1>
          <p className="lede">40 квартир в одном доме. Долгосрочно, без комиссии. Цена на сайте — это платёж в месяц.</p>
          <div className="hero-actions">
            <Link className="btn" href={`/apartments/${preview.id}`}>Смотреть в 3D</Link>
            <Link className="btn-ghost" href="/catalog">Выбрать квартиру</Link>
          </div>
          <dl className="metrics">
            <div><dt>Свободно</dt><dd>{available.length}</dd></div>
            <div><dt>От</dt><dd>{Number.isFinite(min) ? `${Math.round(min / 1000)} тыс` : "—"}</dd></div>
            <div><dt>Залог</dt><dd>1 мес</dd></div>
          </dl>
        </div>
        <div className="hero-visual">
          <HomePreview apartment={preview} />
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <h2>Что уже внутри</h2>
          <p className="section-note">Заезжаете с чемоданом. Крупную мебель и технику покупать не нужно.</p>
        </div>
        <div className="steps">
          {INCLUDED.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <h2>Свободные сейчас</h2>
          <Link href="/catalog">Все квартиры</Link>
        </div>
        <div className="lots">
          {featured.map((item) => (
            <article className="lot" key={item.id}>
              <Link className="lot-plan" href={`/apartments/${item.id}`}>
                <FloorPlan rooms={item.plan} compact />
              </Link>
              <div className="lot-meta">
                <div className="lot-top"><span>№ {item.id}</span><StatusMark status={item.status} /></div>
                <h3>{roomsLong(item.rooms)}</h3>
                <p className="muted">{item.floor} этаж · {formatArea(item.area)} · {item.view}</p>
                <p className="price"><b>{formatRent(item.price)}</b></p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap-wide">
        <div className="section-head">
          <h2>Дом по этажам</h2>
          <p className="section-note">Снизу второй этаж, сверху девятый. Нажмите номер.</p>
        </div>
        <Chessboard apartments={apartments} compact />
      </section>

      <section className="section wrap">
        <div className="section-head">
          <h2>Как снять</h2>
          <p className="section-note">Четыре шага: от выбора квартиры до ключей.</p>
        </div>
        <div className="steps">
          {RENT_STEPS.map((step) => (
            <article key={step.n}>
              <span>{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
        <dl className="facts" style={{ marginTop: 28 }}>
          {HOUSE_FACTS.map(([name, value]) => (
            <div key={name}><dt>{name}</dt><dd>{value}</dd></div>
          ))}
        </dl>
      </section>
    </>
  );
}
