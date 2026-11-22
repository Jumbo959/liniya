import { HOUSE_FACTS, INCLUDED } from "@/lib/content";

export const metadata = { title: "Дом" };

export default function ProgressPage() {
  return (
    <>
      <header className="wrap page-hero">
        <p className="kicker">дом</p>
        <h1>Один подъезд и сад вместо парковки во дворе.</h1>
        <p className="lede">Гостиные смотрят на север, в деревья. Машины остаются на минус первом. Квартиры сдаются уже с мебелью.</p>
      </header>
      <section className="section wrap">
        <div className="steps plain-steps">
          {INCLUDED.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section wrap">
        <dl className="facts">
          {HOUSE_FACTS.map(([name, value]) => (
            <div key={name}><dt>{name}</dt><dd>{value}</dd></div>
          ))}
        </dl>
      </section>
    </>
  );
}
