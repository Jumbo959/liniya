import { recordPull } from "@/lib/actions";
import { avitoFeed, exportable } from "@/lib/feed";
import { readDb } from "@/lib/store";

export async function GET(request: Request) {
  const db = readDb();
  const site = db.settings.siteUrl ? db.settings.siteUrl.replace(/\/$/, "") : new URL(request.url).origin;
  const xml = avitoFeed(db.apartments, db.settings, site);
  await recordPull("pull-avito", exportable(db.apartments, db.settings).length);
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
