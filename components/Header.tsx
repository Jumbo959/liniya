"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { usePrefs } from "./Prefs";

const LINKS = [
  { href: "/catalog", label: "Квартиры" },
  { href: "/purchase", label: "Покупка" },
  { href: "/progress", label: "Ход работ" },
  { href: "/contacts", label: "Контакты" },
];

export function Header({ phone }: { phone: string }) {
  const path = usePathname();
  const { ready, favs, compare } = usePrefs();
  const [open, setOpen] = useState(false);
  if (path.startsWith("/admin")) return null;

  return (
    <header className="site-header">
      <a className="skip" href="#main">К содержанию</a>
      <div className="header-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <b>ЛИНИЯ</b>
          <span>дом · 40 квартир</span>
        </Link>
        <nav className={open ? "nav open" : "nav"} aria-label="Разделы">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={path.startsWith(link.href) ? "page" : undefined} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <a className="nav-phone" href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
        </nav>
        <div className="header-tools">
          <Link className="tool-count" href="/favorites"><span className="only-wide">Избранное </span>{ready ? favs.length : ""}</Link>
          <Link className="tool-count" href="/compare"><span className="only-wide">Сравнение </span>{ready ? compare.length : ""}</Link>
          <a className="phone only-wide" href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
          <button className="menu-btn" type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? "Закрыть" : "Меню"}
          </button>
        </div>
      </div>
    </header>
  );
}
