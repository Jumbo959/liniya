import { MortgageCalc } from "@/components/MortgageCalc";
import { PURCHASE_STEPS } from "@/lib/content";
import { getPublicApartments } from "@/lib/store";

export const metadata = { title: "Покупка" };

export default function PurchasePage() {
  const available = getPublicApartments().filter((item) => item.status === "available");
  const start = available.reduce((min, item) => Math.min(min, item.price), available[0]?.price ?? 20000000);

  return (
    <>
      <header className="wrap page-hero">
        <p className="kicker">покупка</p>
        <h1>Договор, эскроу, платёж.</h1>
        <p className="lede">Считаем до визита в банк. Бронь держит цену пять рабочих дней. Деньги покупателя идут на эскроу, не в оборот стройки.</p>
      </header>
      <section className="section wrap">
        <div className="steps" style={{ color: "inherit" }}>
          {PURCHASE_STEPS.map((step) => (
            <article key={step.n} style={{ borderColor: "var(--line)" }}>
              <span style={{ color: "var(--brick)" }}>{step.n}</span>
              <h3>{step.title}</h3>
              <p style={{ color: "inherit" }}>{step.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section wrap">
        <div className="split">
          <div className="prose">
            <h2>Калькулятор</h2>
            <p>Семейная и IT здесь как сценарий ставки 6%. Стандарт — чтобы увидеть разницу, а не как обещание банка. Рассрочка: половина при договоре, остаток на 18 месяцев без процентов.</p>
            <p>Паркинг — 28 мест, от 2,8 млн. Кладовые от 3,2 м² продаём отдельно, к квартире не привязаны насильно. Ипотеку ведём через Сбер, ВТБ, Дом.РФ и Альфа-Банк: ставка дня сделки, не ставка с баннера.</p>
          </div>
          <MortgageCalc price={start} />
        </div>
      </section>
    </>
  );
}
