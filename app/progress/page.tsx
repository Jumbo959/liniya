import { NEWS, STAGES } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Ход работ" };

export default function ProgressPage() {
  return (
    <>
      <header className="wrap page-hero">
        <p className="kicker">ноябрь 2026</p>
        <h1>Каркас готов. Кирпич идёт вверх.</h1>
        <p className="lede">Ключи — II квартал 2027. Раз в месяц обновляем проценты по факту, не по презентации.</p>
      </header>
      <section className="section wrap">
        <div className="bars">
          {STAGES.map((stage) => (
            <div key={stage.name}>
              <div className="bar-row">
                <strong>{stage.name}</strong>
                <div className="bar"><i style={{ width: `${stage.pct}%` }} /></div>
                <span>{stage.pct}%</span>
              </div>
              <p className="muted">{stage.note}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section wrap">
        <div className="news">
          {NEWS.map((item) => (
            <article key={item.title}>
              <time dateTime={item.date}>{formatDate(item.date)}</time>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
