import { headers } from "next/headers";
import { FeedDesk } from "@/components/FeedDesk";
import { feedWarnings } from "@/lib/feed";
import { formatDateTime } from "@/lib/format";
import { readDb } from "@/lib/store";

export const metadata = { title: "Площадки" };

export default async function FeedPage() {
  const db = readDb();
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const site = (db.settings.siteUrl || `${proto}://${host}`).replace(/\/$/, "");
  return (
    <>
      <p className="kicker">автозагрузка</p>
      <h1 style={{ fontSize: 56, marginBottom: 12 }}>Площадки</h1>
      <p className="prose">Авито, Циан, Яндекс Недвижимость и Домклик забирают фид сами по ссылке. Мы не притворяемся, что отправили объявления в их API: без кабинета застройщика это была бы фикция. Кнопка ниже только отмечает, что ссылку передали менеджеру площадки.</p>
      <FeedDesk settings={db.settings} warnings={feedWarnings(db.apartments, db.settings)} yandexUrl={`${site}/feed/yandex.xml`} avitoUrl={`${site}/feed/avito.xml`} />
      <h2 style={{ fontSize: 36, margin: "28px 0 8px" }}>Журнал</h2>
      <ul>
        {db.feedLog.map((item) => (
          <li key={item.id}>{formatDateTime(item.at)} · {item.target} · {item.count} кв. · {item.note}</li>
        ))}
      </ul>
    </>
  );
}
