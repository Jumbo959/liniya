"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Chessboard } from "./Chessboard";
import { FloorPlan } from "./FloorPlan";
import { StatusMark } from "./StatusMark";
import { formatArea, formatRent, roomsLong, roomsShort } from "@/lib/format";
import type { PublicApartment } from "@/lib/types";

type Initial = {
  rooms?: string;
  floorMin?: string;
  floorMax?: string;
  priceMin?: string;
  priceMax?: string;
  q?: string;
  finish?: string;
  status?: string;
  sort?: string;
  mode?: string;
};

const ROOM_OPTS = [
  { id: "0", label: "студия" },
  { id: "1", label: "1" },
  { id: "2", label: "2" },
  { id: "3", label: "3" },
];

export function CatalogExplorer({ apartments, initial }: { apartments: PublicApartment[]; initial: Initial }) {
  const [rooms, setRooms] = useState<string[]>(initial.rooms ? initial.rooms.split(",") : []);
  const [floorMin, setFloorMin] = useState(initial.floorMin || "");
  const [floorMax, setFloorMax] = useState(initial.floorMax || "");
  const [priceMin, setPriceMin] = useState(initial.priceMin || "");
  const [priceMax, setPriceMax] = useState(initial.priceMax || "");
  const [q, setQ] = useState(initial.q || "");
  const [hideSold, setHideSold] = useState(initial.status === "hide-sold");
  const [sort, setSort] = useState(initial.sort || "price-asc");
  const [mode, setMode] = useState(initial.mode || "cards");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const read = (key: string) => sp.get(key) || "";
    if (read("rooms")) setRooms(read("rooms").split(","));
    if (read("floorMin")) setFloorMin(read("floorMin"));
    if (read("floorMax")) setFloorMax(read("floorMax"));
    if (read("priceMin")) setPriceMin(read("priceMin"));
    if (read("priceMax")) setPriceMax(read("priceMax"));
    if (read("q")) setQ(read("q"));
    if (read("status") === "hide-sold") setHideSold(true);
    if (read("sort")) setSort(read("sort"));
    if (read("mode")) setMode(read("mode"));
  }, []);

  const filtered = useMemo(() => {
    const list = apartments.filter((item) => {
      if (rooms.length && !rooms.includes(String(item.rooms))) return false;
      if (floorMin && item.floor < Number(floorMin)) return false;
      if (floorMax && item.floor > Number(floorMax)) return false;
      if (priceMin && item.price < Number(priceMin) * 1000) return false;
      if (priceMax && item.price > Number(priceMax) * 1000) return false;
      if (hideSold && item.status === "sold") return false;
      if (q && !`${item.id} ${item.title} ${item.view}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "area-desc") return b.area - a.area;
      if (sort === "floor-asc") return a.floor - b.floor || a.position - b.position;
      return a.price - b.price;
    });
    return sorted;
  }, [apartments, rooms, floorMin, floorMax, priceMin, priceMax, hideSold, q, sort]);

  function toggle(list: string[], value: string, set: (next: string[]) => void) {
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  return (
    <div className="wrap-wide catalog">
      <aside className="filters">
        <h1>Квартиры</h1>
        <p className="muted">Цена — аренда в месяц. Серые уже заняты, зелёная рамка значит, что квартиру смотрят.</p>
        <label className="field">
          <span>Номер или вид</span>
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="504, торец" />
        </label>
        <div className="field">
          <span>Комнаты</span>
          <div className="chips">
            {ROOM_OPTS.map((item) => (
              <button key={item.id} type="button" className={rooms.includes(item.id) ? "on" : ""} onClick={() => toggle(rooms, item.id, setRooms)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span>Этаж</span>
          <div className="pair">
            <input inputMode="numeric" placeholder="от" value={floorMin} onChange={(event) => setFloorMin(event.target.value)} />
            <input inputMode="numeric" placeholder="до" value={floorMax} onChange={(event) => setFloorMax(event.target.value)} />
          </div>
        </div>
        <div className="field">
          <span>В месяц, тыс. ₽</span>
          <div className="pair">
            <input inputMode="decimal" placeholder="от" value={priceMin} onChange={(event) => setPriceMin(event.target.value)} />
            <input inputMode="decimal" placeholder="до" value={priceMax} onChange={(event) => setPriceMax(event.target.value)} />
          </div>
        </div>
        <label className="check-row">
          <input type="checkbox" checked={hideSold} onChange={(event) => setHideSold(event.target.checked)} />
          Скрыть занятые
        </label>
      </aside>
      <div>
        <Chessboard apartments={apartments} active={filtered.map((item) => item.id)} />
        <div className="toolbar">
          <p className="count">{filtered.length} из {apartments.length}</p>
          <div className="mode">
            {[
              ["cards", "Карточки"],
              ["list", "Список"],
            ].map(([id, label]) => (
              <button key={id} type="button" className={mode === id ? "on" : ""} onClick={() => setMode(id)}>
                {label}
              </button>
            ))}
            <select className="input" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Сортировка">
              <option value="price-asc">Сначала дешевле в месяц</option>
              <option value="price-desc">Сначала дороже в месяц</option>
              <option value="area-desc">По площади</option>
              <option value="floor-asc">По этажу</option>
            </select>
          </div>
        </div>
        {mode === "list" ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>№</th><th>Комнаты</th><th>Этаж</th><th>Площадь</th><th>Вид</th><th>В месяц</th><th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td><Link href={`/apartments/${item.id}`}>{item.id}</Link></td>
                    <td>{roomsShort(item.rooms)}</td>
                    <td>{item.floor}</td>
                    <td>{formatArea(item.area)}</td>
                    <td>{item.view}</td>
                    <td>{item.status === "sold" ? "—" : formatRent(item.price)}</td>
                    <td><StatusMark status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="lots">
            {filtered.map((item) => (
              <article className="lot" key={item.id}>
                <Link className="lot-plan" href={`/apartments/${item.id}`} aria-label={`Квартира ${item.id}`}>
                  <FloorPlan rooms={item.plan} compact />
                </Link>
                <div className="lot-meta">
                  <div className="lot-top">
                    <span className="num">№ {item.id}</span>
                    <StatusMark status={item.status} />
                  </div>
                  <h3>{roomsLong(item.rooms)}</h3>
                  <p className="muted">{item.floor} этаж · {item.view}</p>
                  <p className="price">
                    <b>{item.status === "sold" ? "Занята" : formatRent(item.price)}</b>
                    <br />
                    <span className="muted">{formatArea(item.area)} · с мебелью</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
        {filtered.length === 0 && <p>Под эти фильтры квартир нет. Снимите этаж или цену.</p>}
      </div>
    </div>
  );
}
