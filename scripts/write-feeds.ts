import fs from "fs";
import path from "path";
import { renderPlanSvg } from "../lib/planSvg";
import { createSeed } from "../lib/seed";
import { avitoFeed, yandexFeed } from "../lib/feed";

const site = "https://jumbo959.github.io/liniya";
const db = createSeed();
const plans = path.join(process.cwd(), "public", "plans");
const feedDir = path.join(process.cwd(), "public", "feed");
fs.mkdirSync(plans, { recursive: true });
fs.mkdirSync(feedDir, { recursive: true });
for (const apartment of db.apartments) {
  fs.writeFileSync(path.join(plans, `${apartment.id}.svg`), renderPlanSvg(apartment.plan));
}
fs.writeFileSync(path.join(feedDir, "yandex.xml"), yandexFeed(db.apartments, db.settings, site));
fs.writeFileSync(path.join(feedDir, "avito.xml"), avitoFeed(db.apartments, db.settings, site));
console.log(`feeds and ${db.apartments.length} plans written`);
