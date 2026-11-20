import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAction } from "@/lib/actions";
import { COOKIE, isAuthed } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  if (!isAuthed(jar.get(COOKIE)?.value)) redirect("/admin/login");
  return (
    <div className="admin">
      <aside className="admin-nav">
        <Link href="/" className="brand"><b>ЛИНИЯ</b><span>офис</span></Link>
        <Link href="/admin">Обзор</Link>
        <Link href="/admin/apartments">Квартиры</Link>
        <Link href="/admin/leads">Заявки</Link>
        <Link href="/admin/feed">Площадки</Link>
        <form action={logoutAction}><button className="btn-ghost small" type="submit">Выйти</button></form>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
