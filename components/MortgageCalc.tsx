"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { annuity, MORTGAGE_PRESETS } from "@/lib/mortgage";

export function MortgageCalc({ price }: { price: number }) {
  const [mode, setMode] = useState<(typeof MORTGAGE_PRESETS)[number]["id"] | "installment">("family");
  const [value, setValue] = useState(price);
  const [down, setDown] = useState(20);
  const [years, setYears] = useState(20);
  const preset = MORTGAGE_PRESETS.find((item) => item.id === mode);

  const result = useMemo(() => {
    if (mode === "installment") {
      const first = value * 0.5;
      const monthly = (value - first) / 18;
      return { payment: monthly, first, credit: value - first, rate: 0, over: 0, note: "18 месяцев без процентов, до июня 2027" };
    }
    const first = (value * down) / 100;
    const credit = Math.max(0, value - first);
    const payment = annuity(credit, preset?.rate ?? 6, years);
    const over = payment * years * 12 - credit;
    return { payment, first, credit, rate: preset?.rate ?? 6, over, note: preset?.note ?? "" };
  }, [mode, value, down, years, preset]);

  return (
    <div className="calc">
      <div className="chips">
        {MORTGAGE_PRESETS.map((item) => (
          <button key={item.id} type="button" className={mode === item.id ? "on" : ""} onClick={() => setMode(item.id)}>
            {item.label} {item.rate}%
          </button>
        ))}
        <button type="button" className={mode === "installment" ? "on" : ""} onClick={() => setMode("installment")}>
          Рассрочка 0%
        </button>
      </div>
      <label className="field">
        <span>Цена квартиры, ₽</span>
        <input className="input" type="number" min={1000000} step={50000} value={value} onChange={(event) => setValue(Number(event.target.value))} />
      </label>
      {mode !== "installment" && (
        <>
          <label className="field">
            <span>Взнос {down}%</span>
            <input className="range" type="range" min={20} max={80} value={down} onChange={(event) => setDown(Number(event.target.value))} />
          </label>
          <label className="field">
            <span>Срок {years} лет</span>
            <input className="range" type="range" min={5} max={30} value={years} onChange={(event) => setYears(Number(event.target.value))} />
          </label>
        </>
      )}
      <div className="calc-out">
        <div>
          <span className="label">Платёж в месяц</span>
          <strong>{formatPrice(result.payment)}</strong>
        </div>
        <div>
          <span className="label">Первый взнос</span>
          <strong>{formatPrice(result.first)}</strong>
        </div>
        <div>
          <span className="label">{mode === "installment" ? "Остаток" : "Переплата"}</span>
          <strong>{formatPrice(mode === "installment" ? result.credit : result.over)}</strong>
        </div>
      </div>
      <p className="muted">{result.note}. Калькулятор считает аннуитет и не заменяет одобрение банка. Льготные программы имеют лимит суммы.</p>
    </div>
  );
}
