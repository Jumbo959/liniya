"use client";

import { useState } from "react";
import { usePrefs } from "./Prefs";

export function SaveButtons({ id }: { id: string }) {
  const { favs, compare, toggleFav, toggleCompare, notice } = usePrefs();
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <div className="hero-actions">
        <button className="btn-ghost small" type="button" onClick={() => toggleFav(id)}>
          {favs.includes(id) ? "В избранном" : "В избранное"}
        </button>
        <button className="btn-ghost small" type="button" onClick={() => toggleCompare(id)}>
          {compare.includes(id) ? "В сравнении" : "Сравнить"}
        </button>
        <button
          className="btn-ghost small"
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
          }}
        >
          {copied ? "Ссылка скопирована" : "Скопировать ссылку"}
        </button>
        <a className="btn-ghost small" href={`/apartments/${id}/print`}>Печать</a>
      </div>
      {notice && <p className="form-error">{notice}</p>}
    </div>
  );
}
