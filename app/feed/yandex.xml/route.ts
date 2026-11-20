import { recordPull } from "@/lib/actions";
import { exportable, yandexFeed } from "@/lib/feed";
import { readDb } from "@/lib/store";

export async function GET(request: Request) {
  const db = readDb();
  const site = siteOf(request, db.settings.siteUrl);
  const xml = yandexFeed(db.apartments, db.settings, site);
  await recordPull("pull-yandex", exportable(db.apartments, db.settings).length);
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}

function siteOf(request: Request, configured: string) {
  if (configured) return configured.replace(/\/$/, "");
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}
