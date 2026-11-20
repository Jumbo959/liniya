import { assertNoOverlap } from "./areas";
import type { PlanRoom, PlanType } from "./types";

export const PLANS: Record<PlanType, PlanRoom[]> = {
  studio: [
    { name: "Кухня-гостиная", x: 0, y: 0, w: 5.6, d: 3.7, kind: "living" },
    { name: "Санузел", x: 0, y: 3.7, w: 2.0, d: 1.9, kind: "bath" },
    { name: "Прихожая", x: 2.0, y: 3.7, w: 2.2, d: 1.9, kind: "hall" },
    { name: "Гардероб", x: 4.2, y: 3.7, w: 1.4, d: 1.9, kind: "wardrobe" },
    { name: "Балкон", x: 1.2, y: -1.2, w: 3.2, d: 1.2, kind: "balcony" },
  ],
  one: [
    { name: "Спальня", x: 0, y: 0, w: 3.4, d: 3.8, kind: "bedroom" },
    { name: "Кухня-гостиная", x: 3.4, y: 0, w: 4.2, d: 4.6, kind: "living" },
    { name: "Санузел", x: 0, y: 3.8, w: 1.8, d: 1.95, kind: "bath" },
    { name: "Гардероб", x: 1.8, y: 3.8, w: 1.6, d: 1.0, kind: "wardrobe" },
    { name: "Коридор", x: 1.8, y: 4.8, w: 1.6, d: 0.95, kind: "hall" },
    { name: "Прихожая", x: 3.4, y: 4.6, w: 4.2, d: 1.15, kind: "hall" },
    { name: "Балкон", x: 3.9, y: -1.2, w: 3.0, d: 1.2, kind: "balcony" },
  ],
  two: [
    { name: "Спальня", x: 0, y: 0, w: 3.4, d: 4.0, kind: "bedroom" },
    { name: "Гостиная", x: 3.4, y: 0, w: 5.0, d: 4.0, kind: "living" },
    { name: "Санузел", x: 0, y: 4.0, w: 1.8, d: 2.6, kind: "bath" },
    { name: "Прихожая", x: 1.8, y: 4.0, w: 1.6, d: 2.6, kind: "hall" },
    { name: "Кухня", x: 3.4, y: 4.0, w: 3.4, d: 2.6, kind: "kitchen" },
    { name: "Гардеробная", x: 6.8, y: 4.0, w: 1.6, d: 2.6, kind: "wardrobe" },
    { name: "Балкон", x: 4.0, y: -1.2, w: 3.6, d: 1.2, kind: "balcony" },
  ],
  "two-wide": [
    { name: "Спальня", x: 0, y: 0, w: 3.3, d: 3.6, kind: "bedroom" },
    { name: "Детская", x: 3.3, y: 0, w: 3.0, d: 3.6, kind: "bedroom" },
    { name: "Гостиная", x: 6.3, y: 0, w: 4.2, d: 5.0, kind: "living" },
    { name: "Кухня", x: 3.3, y: 3.6, w: 3.0, d: 2.6, kind: "kitchen" },
    { name: "Ванная", x: 0, y: 3.6, w: 1.9, d: 2.4, kind: "bath" },
    { name: "Санузел", x: 1.9, y: 3.6, w: 1.4, d: 1.6, kind: "bath" },
    { name: "Гардероб", x: 1.9, y: 5.2, w: 1.4, d: 0.8, kind: "wardrobe" },
    { name: "Прихожая", x: 0, y: 6.0, w: 3.3, d: 1.5, kind: "hall" },
    { name: "Балкон", x: 6.8, y: -1.2, w: 3.2, d: 1.2, kind: "balcony" },
  ],
  three: [
    { name: "Мастер-спальня", x: 0, y: 0, w: 3.6, d: 3.9, kind: "bedroom" },
    { name: "Детская", x: 3.6, y: 0, w: 3.0, d: 3.4, kind: "bedroom" },
    { name: "Гостиная", x: 6.6, y: 0, w: 4.3, d: 6.2, kind: "living" },
    { name: "Кабинет", x: 10.9, y: 0, w: 2.9, d: 3.2, kind: "bedroom" },
    { name: "Кухня", x: 3.6, y: 3.4, w: 3.0, d: 2.8, kind: "kitchen" },
    { name: "Ванная", x: 0, y: 3.9, w: 2.1, d: 2.3, kind: "bath" },
    { name: "Санузел", x: 2.1, y: 3.9, w: 1.5, d: 1.5, kind: "bath" },
    { name: "Кладовая", x: 2.1, y: 5.4, w: 1.5, d: 0.8, kind: "wardrobe" },
    { name: "Прихожая", x: 0, y: 6.2, w: 3.6, d: 1.5, kind: "hall" },
    { name: "Гардеробная", x: 10.9, y: 3.2, w: 2.9, d: 3.0, kind: "wardrobe" },
    { name: "Балкон", x: 7.0, y: -1.2, w: 3.4, d: 1.2, kind: "balcony" },
  ],
};

for (const [name, rooms] of Object.entries(PLANS)) {
  assertNoOverlap(name, rooms);
}

export function clonePlan(type: PlanType): PlanRoom[] {
  return PLANS[type].map((room) => ({ ...room }));
}

export const PLAN_BLURB: Record<PlanType, string> = {
  studio:
    "Кухня и жилая зона в одной комнате, окно и балкон выходят в сад. Санузел и гардероб стоят у входа с галереи и не режут свет. Спокойный формат для одного человека или пары.",
  one:
    "Спальня отдельно от кухни-гостиной, обе с окном в сад. Вход с галереи через прихожую, рядом санузел и гардероб. Без проходных комнат.",
  two:
    "Спальня и гостиная смотрят в сад, кухня выходит к галерее и соединена с гостиной дверью. Отдельная гардеробная, один санузел. План прямой, без скошенных углов.",
  "two-wide":
    "Две спальни на сад и гостиная с дополнительным окном на восток. Кухня между детской и гостиной, два санузла, гардероб у входа. Чистовая отделка уже в договоре.",
  three:
    "Мастер-спальня и детская на сад, кабинет — на торец, к переулку. Гостиная с балконом, два санузла и гардеробная на торцевой стене. Самая тихая квартира в ряду — соседей с одной стороны нет.",
};

export const PLAN_OPTIONS: { id: PlanType; label: string }[] = [
  { id: "studio", label: "Студия, торец" },
  { id: "one", label: "1-комнатная" },
  { id: "two", label: "2-комнатная, сад" },
  { id: "two-wide", label: "2-комнатная, угловые окна" },
  { id: "three", label: "3-комнатная, торец" },
];
