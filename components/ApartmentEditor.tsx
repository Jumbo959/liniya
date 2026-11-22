"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FloorPlan } from "./FloorPlan";
import { deleteApartment, saveApartment, type ApartmentDraft } from "@/lib/actions";
import { apartmentArea } from "@/lib/areas";
import { clonePlan, PLAN_OPTIONS } from "@/lib/plans";
import type { Apartment, Finishing, PlanRoom, PlanType, RoomKind, WindowSide } from "@/lib/types";

const KINDS: RoomKind[] = ["living", "bedroom", "kitchen", "bath", "hall", "wardrobe", "balcony"];
const SIDES: { id: WindowSide; label: string }[] = [
  { id: "north", label: "север, сад" },
  { id: "east", label: "восток" },
  { id: "south", label: "юг, галерея" },
  { id: "west", label: "запад" },
];

const empty = (): ApartmentDraft => ({
  originalId: null,
  id: "",
  floor: 2,
  position: 1,
  rooms: 1,
  title: "1-комнатная",
  price: 20000000,
  status: "available",
  reservedUntil: null,
  view: "сад",
  finishing: "без отделки",
  windowSides: ["north"],
  planType: "one",
  plan: clonePlan("one"),
  blurb: "",
  photoUrls: [],
  internalNote: "",
  ceiling: 3.05,
});

function fromApartment(apartment: Apartment): ApartmentDraft {
  return {
    originalId: apartment.id,
    id: apartment.id,
    floor: apartment.floor,
    position: apartment.position,
    rooms: apartment.rooms,
    title: apartment.title,
    price: apartment.price,
    status: apartment.status,
    reservedUntil: apartment.reservedUntil,
    view: apartment.view,
    finishing: apartment.finishing,
    windowSides: apartment.windowSides,
    planType: apartment.planType,
    plan: apartment.plan.map((room) => ({ ...room })),
    blurb: apartment.blurb,
    photoUrls: apartment.photoUrls,
    internalNote: apartment.internalNote,
    ceiling: apartment.ceiling,
  };
}

export function ApartmentEditor({ apartment }: { apartment: Apartment | null }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ApartmentDraft>(apartment ? fromApartment(apartment) : empty());
  const [photos, setPhotos] = useState(apartment?.photoUrls.join("\n") ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const area = useMemo(() => apartmentArea(draft.plan), [draft.plan]);

  function patch<K extends keyof ApartmentDraft>(key: K, value: ApartmentDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function updateRoom(index: number, room: PlanRoom) {
    patch("plan", draft.plan.map((item, i) => (i === index ? room : item)));
  }

  async function onSave() {
    setPending(true);
    setError("");
    const result = await saveApartment({ ...draft, photoUrls: photos.split("\n") });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/apartments");
    router.refresh();
  }

  return (
    <div className="editor">
      <div className="form">
        <div className="pair">
          <label className="field"><span>Номер</span><input value={draft.id} onChange={(e) => patch("id", e.target.value)} /></label>
          <label className="field"><span>Название</span><input value={draft.title} onChange={(e) => patch("title", e.target.value)} /></label>
        </div>
        <div className="pair">
          <label className="field"><span>Этаж</span><input type="number" value={draft.floor} onChange={(e) => patch("floor", Number(e.target.value))} /></label>
          <label className="field"><span>Позиция</span><input type="number" value={draft.position} onChange={(e) => patch("position", Number(e.target.value))} /></label>
        </div>
        <div className="pair">
          <label className="field"><span>Комнат, 0 = студия</span><input type="number" value={draft.rooms} onChange={(e) => patch("rooms", Number(e.target.value))} /></label>
          <label className="field"><span>Цена, ₽</span><input type="number" step={50000} value={draft.price} onChange={(e) => patch("price", Number(e.target.value))} /></label>
        </div>
        <div className="pair">
          <label className="field">
            <span>Статус</span>
            <select value={draft.status} onChange={(e) => patch("status", e.target.value as ApartmentDraft["status"])}>
              <option value="available">свободна</option>
              <option value="reserved">на просмотре</option>
              <option value="sold">занята</option>
            </select>
          </label>
          <label className="field">
            <span>Отделка</span>
            <select value={draft.finishing} onChange={(e) => patch("finishing", e.target.value as Finishing)}>
              <option>без отделки</option>
              <option>white box</option>
              <option>чистовая</option>
            </select>
          </label>
        </div>
        <div className="pair">
          <label className="field"><span>Вид</span><input value={draft.view} onChange={(e) => patch("view", e.target.value)} /></label>
          <label className="field"><span>Потолок, м</span><input type="number" step="0.05" value={draft.ceiling} onChange={(e) => patch("ceiling", Number(e.target.value))} /></label>
        </div>
        {draft.status === "reserved" && (
          <label className="field">
            <span>Бронь до</span>
            <input type="datetime-local" value={draft.reservedUntil ? draft.reservedUntil.slice(0, 16) : ""} onChange={(e) => patch("reservedUntil", e.target.value ? new Date(e.target.value).toISOString() : null)} />
          </label>
        )}
        <div className="field">
          <span>Окна</span>
          <div className="chips">
            {SIDES.map((side) => (
              <button
                key={side.id}
                type="button"
                className={draft.windowSides.includes(side.id) ? "on" : ""}
                onClick={() =>
                  patch(
                    "windowSides",
                    draft.windowSides.includes(side.id)
                      ? draft.windowSides.filter((item) => item !== side.id)
                      : [...draft.windowSides, side.id],
                  )
                }
              >
                {side.label}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          <span>Шаблон плана</span>
          <select
            value={draft.planType}
            onChange={(e) => {
              const planType = e.target.value as PlanType;
              patch("planType", planType);
              patch("plan", clonePlan(planType));
            }}
          >
            {PLAN_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <div className="table-wrap room-table">
          <table>
            <thead>
              <tr><th>Комната</th><th>Тип</th><th>x</th><th>y</th><th>шир.</th><th>глуб.</th><th></th></tr>
            </thead>
            <tbody>
              {draft.plan.map((room, index) => (
                <tr key={index}>
                  <td><input value={room.name} onChange={(e) => updateRoom(index, { ...room, name: e.target.value })} /></td>
                  <td>
                    <select value={room.kind} onChange={(e) => updateRoom(index, { ...room, kind: e.target.value as RoomKind })}>
                      {KINDS.map((kind) => <option key={kind}>{kind}</option>)}
                    </select>
                  </td>
                  {(["x", "y", "w", "d"] as const).map((key) => (
                    <td key={key}><input type="number" step="0.1" value={room[key]} onChange={(e) => updateRoom(index, { ...room, [key]: Number(e.target.value) })} /></td>
                  ))}
                  <td><button type="button" className="btn-ghost small" onClick={() => patch("plan", draft.plan.filter((_, i) => i !== index))}>убрать</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="btn-ghost" onClick={() => patch("plan", [...draft.plan, { name: "Комната", x: 0, y: 0, w: 3, d: 3, kind: "bedroom" }])}>
          Добавить комнату
        </button>
        <label className="field"><span>Текст для сайта и фида</span><textarea value={draft.blurb} onChange={(e) => patch("blurb", e.target.value)} /></label>
        <label className="field"><span>Фото, по одной ссылке в строке</span><textarea value={photos} onChange={(e) => setPhotos(e.target.value)} placeholder="https://..." /></label>
        <label className="field"><span>Заметка офиса, на сайт не уходит</span><textarea value={draft.internalNote} onChange={(e) => patch("internalNote", e.target.value)} /></label>
        {error && <p className="form-error">{error}</p>}
        <div className="hero-actions">
          <button className="btn" type="button" disabled={pending} onClick={onSave}>{pending ? "Сохраняем" : "Сохранить"}</button>
          {draft.originalId && (
            <button
              className="btn-ghost"
              type="button"
              onClick={async () => {
                if (!confirm(`Удалить ${draft.originalId}?`)) return;
                await deleteApartment(draft.originalId!);
                router.push("/admin/apartments");
                router.refresh();
              }}
            >
              Удалить
            </button>
          )}
        </div>
      </div>
      <aside>
        <p className="muted">Площадь по чертежу: {area.toLocaleString("ru-RU")} м². Балкон не считается.</p>
        <div className="studio"><FloorPlan rooms={draft.plan} /></div>
      </aside>
    </div>
  );
}
