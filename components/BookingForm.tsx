"use client";

import { useState } from "react";
import type { LeadType } from "@/lib/types";

const TIMES = ["", "будни, 10–13", "будни, 13–17", "будни, 17–20", "выходные"];

async function sendLead(payload: {
  name: string;
  phone: string;
  email: string;
  type: LeadType;
  apartmentId: string;
  message: string;
  time: string;
  company?: string;
}) {
  if (payload.company) return { ok: true as const, id: "L-0", note: "Заявка принята." };
  const digits = payload.phone.replace(/\D/g, "");
  if (payload.name.trim().length < 2) return { ok: false as const, error: "Как к вам обращаться?" };
  if (digits.length < 10) return { ok: false as const, error: "Проверьте телефон" };
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok || response.status === 400) return (await response.json()) as { ok: true; id: string; note: string } | { ok: false; error: string };
  } catch {
    /* статическая публикация без сервера */
  }
  const id = `L-${Date.now().toString().slice(-4)}`;
  const note =
    payload.type === "booking" && payload.apartmentId
      ? `Квартира ${payload.apartmentId} отмечена для брони. На этой ссылке заявка сохраняется в вашем браузере, офис увидит её в локальной версии.`
      : "Заявка записана в этом браузере. Перезвоним, если открыта офисная версия.";
  const prev = JSON.parse(localStorage.getItem("liniya.leads") || "[]");
  localStorage.setItem("liniya.leads", JSON.stringify([{ id, ...payload, at: new Date().toISOString() }, ...prev].slice(0, 20)));
  return { ok: true as const, id, note };
}

export function BookingForm({
  apartmentId = "",
  status,
  choices,
}: {
  apartmentId?: string;
  status?: "available" | "reserved" | "sold";
  choices?: { id: string; label: string }[];
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [apt, setApt] = useState(apartmentId);

  const types = (
    [
      { id: "booking", label: "Бронь на 5 дней" },
      { id: "viewing", label: "Просмотр" },
      { id: "mortgage", label: "Посчитать ипотеку" },
      { id: "consult", label: "Просто поговорить" },
      { id: "waitlist", label: "Лист ожидания" },
    ] as { id: LeadType; label: string }[]
  ).filter((item) => status !== "sold" || item.id !== "booking");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    const payload = {
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      email: String(data.get("email") || ""),
      type: String(data.get("type") || "consult") as LeadType,
      apartmentId: String(data.get("apartmentId") || ""),
      message: String(data.get("message") || ""),
      time: String(data.get("time") || ""),
      company: String(data.get("company") || ""),
    };
    const result = await sendLead(payload);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(`${result.id}. ${result.note}`);
    event.currentTarget.reset();
  }

  if (done) return <div className="form-note">{done}</div>;

  return (
    <form className="form" onSubmit={onSubmit}>
      <input className="hp" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <label className="field">
        <span>Имя</span>
        <input name="name" required autoComplete="name" placeholder="Анна" />
      </label>
      <label className="field">
        <span>Телефон</span>
        <input name="phone" required autoComplete="tel" placeholder="+7 900 000-00-00" />
      </label>
      <label className="field">
        <span>Почта, если удобно</span>
        <input name="email" type="email" autoComplete="email" />
      </label>
      {choices ? (
        <label className="field">
          <span>Квартира</span>
          <select name="apartmentId" value={apt} onChange={(event) => setApt(event.target.value)}>
            <option value="">Пока не выбрал</option>
            {choices.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="apartmentId" value={apartmentId} />
      )}
      <label className="field">
        <span>Что нужно</span>
        <select name="type" defaultValue={status === "sold" ? "waitlist" : apartmentId ? "booking" : "consult"}>
          {types.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Когда звонить</span>
        <select name="time" defaultValue="">
          {TIMES.map((item) => (
            <option key={item} value={item}>{item || "Как получится"}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Комментарий</span>
        <textarea name="message" maxLength={1000} placeholder="Ипотека, дети, срок въезда" />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="btn" type="submit" disabled={pending}>{pending ? "Записываем" : "Отправить заявку"}</button>
      <p className="muted">Бронь — 100 000 ₽ на 5 рабочих дней, цена фиксируется. Если договор не подписываем, депозит возвращаем.</p>
    </form>
  );
}
