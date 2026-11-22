"use client";

import { formatPrice, formatRent } from "@/lib/format";

export function MortgageCalc({ price }: { price: number }) {
  const utilities = 6500;
  return (
    <div className="calc">
      <p className="label">Платёж</p>
      <div className="calc-out">
        <div>
          <span className="label">Аренда</span>
          <strong>{formatRent(price)}</strong>
        </div>
        <div>
          <span className="label">Залог</span>
          <strong>{formatPrice(price)}</strong>
        </div>
        <div>
          <span className="label">Комиссия</span>
          <strong>0 ₽</strong>
        </div>
      </div>
      <p className="muted">Коммуналка отдельно, обычно около {formatPrice(utilities)} в месяц: свет, вода и отопление по счётчикам. Интернет тоже отдельно. Залог возвращаем, если нет долга и поломок.</p>
    </div>
  );
}
