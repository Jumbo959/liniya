import Link from "next/link";
import { Chessboard } from "@/components/Chessboard";
import { Facade } from "@/components/Facade";
import { FloorPlan } from "@/components/FloorPlan";
import { HomePreview } from "@/components/HomePreview";
import { StatusMark } from "@/components/StatusMark";
import { HOUSE_FACTS, NEWS, PURCHASE_STEPS, STAGES } from "@/lib/content";
import { formatArea, formatDate, formatPrice, roomsLong } from "@/lib/format";
import { getPublicApartments } from "@/lib/store";

export default function HomePage() {
  const apartments = getPublicApartments();
  const available = apartments.filter((item) => item.status === "available");
  const min = available.reduce((acc, item) => Math.min(acc, item.price), Number.POSITIVE_INFINITY);
  const featured = [0, 2, 3]
    .map((rooms) => available.find((item) => item.rooms === rooms && item.floor >= 4 && item.floor <= 7))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const preview = available.find((item) => item.id === "505") || available.find((item) => item.rooms === 3) || available[0];

  return (
    <>
      <section className="wrap-wide hero">
        <div className="hero-copy">
          <p className="kicker">Москва · Даниловский район · улица Ленточная, 8</p>
          <h1>Дом<br />на сорок<br />квартир.</h1>
          <p className="lede">Линейный кирпичный дом вдоль тихого переулка. Гостиные смотрят в сад, машины остаются на минус первом. Продажа напрямую, без переуступки.</p>
          <div className="hero-actions">
            <Link className="btn" href={`/apartments/${preview.id}`}>Смотреть в 3D</Link>
            <Link className="btn-ghost" href="/catalog">Все 40 квартир</Link>
          </div>
          <dl className="metrics">
            <div><dt>В продаже</dt><dd>{available.length}</dd></div>
            <div><dt>От, млн</dt><dd>{Number.isFinite(min) ? Math.round(min / 1_000_000) : "—"}</dd></div>
            <div><dt>Ключи</dt><dd>II/27</dd></div>
          </dl>
        </div>
        <div className="hero-visual">
          <HomePreview apartment={preview} />
        </div>
      </section>
      <section className="wrap-wide" style={{ paddingBottom: 28 }}>
        <Facade apartments={apartments} />
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, index) => (
            <span key={index}>кирпич ручной формовки · травертин · дуб · графитовый алюминий · сад без машин · эскроу · 214-ФЗ · потолки 3,05 ·</span>
          ))}
        </div>
      </div>

      <section className="section wrap" id="house">
        <div className="split">
          <div className="manifesto">
            <p className="kicker">01 — дом</p>
            <h2>Один подъезд. Восемь жилых этажей. Галерея вместо тёмного коридора.</h2>
            <p>Дом стоит длинной стороной вдоль переулка и короткой — к набережной. Все гостиные на север, в сад. Торцевые квартиры берут ещё и боковой свет: утренний с запада или вечерний с переулка.</p>
            <p>Кирпич тёмный, с рваным краем. Окна в пол. Во входной группе травертин, почта в нише, колясочная и консьерж. Двор не кольцо для разворота, а сад.</p>
          </div>
          <dl className="facts">
            {HOUSE_FACTS.map(([name, value]) => (
              <div key={name}><dt>{name}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section wrap-wide">
        <div className="section-head">
          <h2>Шахматка</h2>
          <p className="section-note">Снизу второй этаж, сверху девятый. Пять квартир в ряд. Нажмите номер.</p>
        </div>
        <Chessboard apartments={apartments} compact />
      </section>

      <section className="section wrap">
        <div className="section-head">
          <h2>Сейчас свободны</h2>
          <Link href="/catalog">Весь список</Link>
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
                <p className="muted">{item.floor} этаж · {item.view}</p>
                <p className="price"><b>{formatPrice(item.price)}</b><br /><span className="muted">{formatArea(item.area)}</span></p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section night">
        <div className="wrap">
          <div className="section-head">
            <h2>Как покупается</h2>
            <p className="section-note">Без «уникальной возможности». Пять шагов, которые реально происходят в офисе.</p>
          </div>
          <div className="steps">
            {PURCHASE_STEPS.map((step) => (
              <article key={step.n}>
                <span>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section wrap">
        <div className="split">
          <div>
            <p className="kicker">ноябрь 2026</p>
            <h2>Каркас закрыт, кирпич на шестом.</h2>
            <div className="bars" style={{ marginTop: 24 }}>
              {STAGES.map((stage) => (
                <div className="bar-row" key={stage.name}>
                  <div>{stage.name}</div>
                  <div className="bar" aria-hidden="true"><i style={{ width: `${stage.pct}%` }} /></div>
                  <div>{stage.pct}%</div>
                </div>
              ))}
            </div>
          </div>
          <div className="news" style={{ gridTemplateColumns: "1fr" }}>
            {NEWS.map((item) => (
              <article key={item.title}>
                <time dateTime={item.date}>{formatDate(item.date)}</time>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
