"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer({ phone, email, address }: { phone: string; email: string; address: string }) {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <div className="footer-brand">ЛИНИЯ</div>
          <p className="fine">Москва, Даниловский район, {address}. Офис продаж ежедневно с 10:00 до 20:00. Консьерж на объекте с 8:00 до 22:00.</p>
        </div>
        <div>
          <p><a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></p>
          <p><a href={`mailto:${email}`}>{email}</a></p>
          <p><Link href="/catalog">Наличие</Link></p>
          <p><Link href="/purchase">Как купить</Link></p>
        </div>
        <div>
          <p><Link href="/progress">Ход строительства</Link></p>
          <p><Link href="/contacts">Записаться</Link></p>
          <p><Link href="/admin">Вход для офиса</Link></p>
        </div>
      </div>
      <div className="wrap">
        <p className="fine">Цены на сайте не оферта. Дом, застройщик и объявления вымышлены: это демонстрационный контур продажи, не действующий объект.</p>
      </div>
    </footer>
  );
}
