"use client";

import Link from "next/link";
import { FloorPlan } from "./FloorPlan";
import { StatusMark } from "./StatusMark";
import { formatArea, formatPrice, roomsLong } from "@/lib/format";
import type { PublicApartment } from "@/lib/types";
import { usePrefs } from "./Prefs";

export function SavedList({ apartments, mode }: { apartments: PublicApartment[]; mode: "fav" | "compare" }) {
  const { ready, favs, compare, toggleFav, toggleCompare } = usePrefs();
  const ids = mode === "fav" ? favs : compare;
  const rows = ids.map((id) => apartments.find((item) => item.id === id)).filter((item): item is PublicApartment => Boolean(item));

  if (!ready) return <p className="wrap">Открываем сохранённое…</p>;
  if (!rows.length) {
    return (
      <div className="wrap page-hero">
        <h1>{mode === "fav" ? "Избранное пусто" : "Сравнивать пока нечего"}</h1>
        <p><Link href="/catalog">Выберите квартиры в наличии</Link></p>
      </div>
    );
  }

  if (mode === "compare") {
    const fields: { label: string; value: (item: PublicApartment) => string }[] = [
      { label: "Комнаты", value: (item) => roomsLong(item.rooms) },
      { label: "Площадь", value: (item) => formatArea(item.area) },
      { label: "Этаж", value: (item) => String(item.floor) },
      { label: "Цена", value: (item) => (item.status === "sold" ? "продана" : formatPrice(item.price)) },
      { label: "₽/м²", value: (item) => (item.status === "sold" ? "—" : formatPrice(Math.round(item.price / item.area))) },
      { label: "Отделка", value: (item) => item.finishing },
      { label: "Вид", value: (item) => item.view },
      { label: "Потолок", value: (item) => `${item.ceiling} м` },
      { label: "Статус", value: (item) => item.status },
    ];
    return (
      <div className="wrap page-hero">
        <h1>Сравнение</h1>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                {rows.map((item) => (
                  <th key={item.id}><Link href={`/apartments/${item.id}`}>№ {item.id}</Link></th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>План</td>
                {rows.map((item) => (
                  <td key={item.id}><div style={{ width: 180 }}><FloorPlan rooms={item.plan} compact /></div></td>
                ))}
              </tr>
              {fields.map((field) => (
                <tr key={field.label}>
                  <td>{field.label}</td>
                  {rows.map((item) => <td key={item.id}>{field.value(item)}</td>)}
                </tr>
              ))}
              <tr>
                <td></td>
                {rows.map((item) => (
                  <td key={item.id}><button className="btn-ghost small" type="button" onClick={() => toggleCompare(item.id)}>убрать</button></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap page-hero">
      <h1>Избранное</h1>
      <div className="lots">
        {rows.map((item) => (
          <article className="lot" key={item.id}>
            <Link className="lot-plan" href={`/apartments/${item.id}`}><FloorPlan rooms={item.plan} compact /></Link>
            <div className="lot-meta">
              <div className="lot-top"><span>№ {item.id}</span><StatusMark status={item.status} /></div>
              <h3>{roomsLong(item.rooms)}</h3>
              <p className="price"><b>{item.status === "sold" ? "Продана" : formatPrice(item.price)}</b></p>
              <button className="btn-ghost small" type="button" onClick={() => toggleFav(item.id)}>убрать</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
