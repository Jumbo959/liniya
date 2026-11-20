import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page-hero">
      <p className="kicker">404</p>
      <h1>Такой квартиры нет.</h1>
      <p className="lede">Номер могли снять с продажи или он никогда не существовал.</p>
      <Link className="btn" href="/catalog">Вернуться в наличие</Link>
    </div>
  );
}
