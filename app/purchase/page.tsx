import { MortgageCalc } from "@/components/MortgageCalc";
import { RENT_STEPS } from "@/lib/content";
import { getPublicApartments } from "@/lib/store";

export const metadata = { title: "Условия" };

export default function PurchasePage() {
  const available = getPublicApartments().filter((item) => item.status === "available");
  const start = available.reduce((min, item) => Math.min(min, item.price), available[0]?.price ?? 90000);

  return (
    <>
      <header className="wrap page-hero">
        <p className="kicker">аренда</p>
        <h1>Простые условия, без сюрпризов.</h1>
        <p className="lede">Договор от 11 месяцев. Залог равен одному месяцу и лежит до выезда. Комиссию агенту не берём.</p>
      </header>
      <section className="section wrap">
        <div className="steps plain-steps">
          {RENT_STEPS.map((step) => (
            <article key={step.n}>
              <span>{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section wrap">
        <div className="split">
          <div className="prose">
            <h2>Что платите</h2>
            <p>Каждый месяц — аренда. Коммуналка по счётчикам приходит отдельно. Интернет подключаете на своё имя.</p>
            <p>Можно с детьми и с небольшой собакой или кошкой: напишите об этом в заявке до просмотра. Машиноместо и кладовая, если нужны, добавляются к договору, а не входят в цену квартиры.</p>
          </div>
          <MortgageCalc price={start} />
        </div>
      </section>
    </>
  );
}
