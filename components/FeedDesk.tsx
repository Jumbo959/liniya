"use client";

import { useState } from "react";
import { markFeed, resetDemo, saveSettings } from "@/lib/actions";
import type { FeedTarget, Settings } from "@/lib/types";

export function FeedDesk({
  settings,
  warnings,
  yandexUrl,
  avitoUrl,
}: {
  settings: Settings;
  warnings: string[];
  yandexUrl: string;
  avitoUrl: string;
}) {
  const [form, setForm] = useState(settings);
  const [note, setNote] = useState("");

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="editor">
      <form
        className="form"
        onSubmit={async (event) => {
          event.preventDefault();
          const result = await saveSettings(form);
          setNote(result.ok ? "Настройки фида сохранены." : result.error);
        }}
      >
        <label className="field"><span>Застройщик</span><input value={form.developer} onChange={(e) => set("developer", e.target.value)} /></label>
        <div className="pair">
          <label className="field"><span>Телефон для фида</span><input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></label>
          <label className="field"><span>Телефон на сайте</span><input value={form.phoneDisplay} onChange={(e) => set("phoneDisplay", e.target.value)} /></label>
        </div>
        <label className="field"><span>Почта</span><input value={form.email} onChange={(e) => set("email", e.target.value)} /></label>
        <div className="pair">
          <label className="field"><span>Город</span><input value={form.city} onChange={(e) => set("city", e.target.value)} /></label>
          <label className="field"><span>Район</span><input value={form.district} onChange={(e) => set("district", e.target.value)} /></label>
        </div>
        <label className="field"><span>Адрес</span><input value={form.address} onChange={(e) => set("address", e.target.value)} /></label>
        <label className="field">
          <span>NewDevelopmentId Авито</span>
          <input value={form.newDevelopmentId} onChange={(e) => set("newDevelopmentId", e.target.value)} placeholder="из кабинета новостроек" />
        </label>
        <div className="pair">
          <label className="field"><span>Депозит брони, ₽</span><input type="number" value={form.bookingDeposit} onChange={(e) => set("bookingDeposit", Number(e.target.value))} /></label>
          <label className="field"><span>Дней брони, рабочие</span><input type="number" value={form.bookingDays} onChange={(e) => set("bookingDays", Number(e.target.value))} /></label>
        </div>
        <label className="check-row"><input type="checkbox" checked={form.exportReserved} onChange={(e) => set("exportReserved", e.target.checked)} /> Выгружать забронированные</label>
        <label className="check-row"><input type="checkbox" checked={form.exportSold} onChange={(e) => set("exportSold", e.target.checked)} /> Выгружать занятые</label>
        <button className="btn" type="submit">Сохранить настройки</button>
        {note && <p>{note}</p>}
      </form>
      <aside>
        {warnings.map((item) => <p className="warn" key={item}>{item}</p>)}
        <p><a href={yandexUrl}>Яндекс / Циан / Домклик</a></p>
        <p className="muted">{yandexUrl}</p>
        <p><a href={avitoUrl}>Авито</a></p>
        <p className="muted">{avitoUrl}</p>
        <div className="hero-actions">
          {(["avito", "yandex", "cian", "domclick"] as FeedTarget[]).map((target) => (
            <button key={target} className="btn-ghost small" type="button" onClick={() => markFeed(target).then(() => setNote(`Отметили передачу: ${target}`))}>
              Отдали в {target}
            </button>
          ))}
        </div>
        <button
          className="btn-ghost"
          type="button"
          onClick={async () => {
            if (!confirm("Вернуть исходные 40 квартир и заявки? Текущие правки сотрутся.")) return;
            await resetDemo();
            location.reload();
          }}
        >
          Вернуть демо-данные
        </button>
      </aside>
    </div>
  );
}
