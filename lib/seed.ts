import { apartmentArea } from "./areas";
import { clonePlan, PLAN_BLURB } from "./plans";
import type { Apartment, Database, Finishing, PlanType, WindowSide } from "./types";

const NOW = "2026-04-11T10:00:00.000Z";

const SOLD = new Set(["202", "205", "302", "304", "401", "503", "604", "802"]);
const RESERVED = new Set(["203", "305", "406", "507", "703", "904"]);

const RESERVED_UNTIL: Record<string, string> = {
  "203": "2026-11-25T18:00:00.000Z",
  "305": "2026-11-27T18:00:00.000Z",
  "404": "2026-11-18T18:00:00.000Z",
  "406": "2026-12-01T18:00:00.000Z",
  "507": "2026-11-24T18:00:00.000Z",
  "703": "2026-11-29T18:00:00.000Z",
  "904": "2026-12-04T18:00:00.000Z",
};

const TYPES: Record<
  number,
  { planType: PlanType; rooms: number; title: string; view: string; windowSides: WindowSide[]; finishing: Finishing }
> = {
  1: {
    planType: "studio",
    rooms: 0,
    title: "Студия",
    view: "торец, сад",
    windowSides: ["north", "west"],
    finishing: "white box",
  },
  2: {
    planType: "one",
    rooms: 1,
    title: "1-комнатная",
    view: "сад",
    windowSides: ["north"],
    finishing: "без отделки",
  },
  3: {
    planType: "two-wide",
    rooms: 2,
    title: "2-комнатная",
    view: "сад, угловые окна",
    windowSides: ["north", "east"],
    finishing: "чистовая",
  },
  4: {
    planType: "two",
    rooms: 2,
    title: "2-комнатная",
    view: "сад",
    windowSides: ["north"],
    finishing: "white box",
  },
  5: {
    planType: "three",
    rooms: 3,
    title: "3-комнатная",
    view: "торец, переулок",
    windowSides: ["north", "east"],
    finishing: "без отделки",
  },
};

const RENT_PER_M: Record<number, number> = { 0: 3100, 1: 2950, 2: 2750, 3: 2600 };

function priceFor(area: number, rooms: number, floor: number, view: string) {
  const viewK = view.includes("переулок") ? 1.1 : view.includes("углов") ? 1.06 : view.includes("торец") ? 1.04 : 1;
  const floorK = 1 + (floor - 2) * 0.012;
  const raw = area * (RENT_PER_M[rooms] ?? 2800) * viewK * floorK;
  return Math.round(raw / 1000) * 1000;
}

function featuresFor(planType: PlanType, view: string) {
  const features = ["мебель и техника", "балкон"];
  if (planType === "two-wide" || planType === "three") features.unshift("два санузла");
  if (planType === "three") features.unshift("мастер-спальня", "гардеробная", "кабинет");
  if (planType === "two") features.unshift("гардеробная", "отдельная кухня");
  if (view.includes("переулок") || view.includes("торец")) features.push("окна на две стороны");
  if (view.includes("углов")) features.push("угловой свет");
  return features;
}

function floorSentence(floor: number) {
  if (floor >= 8) return " Верх дома: потолок 3,15 м, сад читается целиком.";
  if (floor <= 3) return " Нижний жилой этаж, сад близко, вечерний свет мягче.";
  return " Средний этаж: кроны уже не закрывают окно, до крыши далеко.";
}

function makeApartment(floor: number, position: number): Apartment {
  const spec = TYPES[position];
  const id = String(floor * 100 + position);
  const plan = clonePlan(spec.planType);
  const area = apartmentArea(plan);
  const ceiling = floor >= 8 ? 3.15 : 3.05;
  let status: Apartment["status"] = "available";
  if (SOLD.has(id)) status = "sold";
  else if (RESERVED.has(id) || id === "404") status = "reserved";
  return {
    id,
    floor,
    position,
    rooms: spec.rooms,
    title: spec.title,
    area,
    ceiling,
    price: priceFor(area, spec.rooms, floor, spec.view),
    status,
    reservedUntil: status === "reserved" ? (RESERVED_UNTIL[id] ?? "2026-11-28T18:00:00.000Z") : null,
    view: spec.view,
    finishing: spec.finishing,
    windowSides: spec.windowSides,
    planType: spec.planType,
    plan,
    features: featuresFor(spec.planType, spec.view),
    blurb: PLAN_BLURB[spec.planType] + floorSentence(floor) + " Сдаётся надолго, с мебелью и техникой.",
    photoUrls: [],
    internalNote: "",
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export function createSeed(): Database {
  const apartments: Apartment[] = [];
  for (let floor = 2; floor <= 9; floor++) {
    for (let position = 1; position <= 5; position++) apartments.push(makeApartment(floor, position));
  }

  return {
    apartments,
    settings: {
      complexName: "Линия",
      developer: "ООО «Линия Девелопмент»",
      phone: "+74951204040",
      phoneDisplay: "+7 495 120-40-40",
      email: "hello@liniya.demo",
      city: "Москва",
      district: "Даниловский район",
      address: "улица Ленточная, дом 8",
      siteUrl: "",
      newDevelopmentId: "",
      bookingDeposit: 0,
      bookingDays: 3,
      exportReserved: true,
      exportSold: false,
      latitude: "",
      longitude: "",
      salesName: "Анна Крылова",
    },
    leads: [
      {
        id: "L-1001",
        createdAt: "2026-11-20T06:40:00.000Z",
        name: "Мария Соколова",
        phone: "+7 916 440-18-22",
        email: "m.sokolova@mail.ru",
        type: "booking",
        apartmentId: "203",
        message: "Хотим посмотреть 203 в субботу. Двое, с собакой среднего размера.",
        time: "будни, 17–20",
        status: "reserved",
        managerNote: "Просмотр до 25 ноября, собака согласована.",
      },
      {
        id: "L-1002",
        createdAt: "2026-11-19T13:05:00.000Z",
        name: "Игорь Левин",
        phone: "+7 903 221-09-14",
        email: "",
        type: "consult",
        apartmentId: "505",
        message: "Спрашивает, входит ли интернет и можно ли с ноября на год.",
        time: "будни, 13–17",
        status: "meeting",
        managerNote: "Встреча в шоуруме 21 ноября, 12:00.",
      },
      {
        id: "L-1003",
        createdAt: "2026-11-18T08:20:00.000Z",
        name: "Елена Ву",
        phone: "+7 925 100-44-73",
        email: "elena.vu@gmail.com",
        type: "viewing",
        apartmentId: "507",
        message: "Смотрела 3-комнатные на верхних этажах. Интересует торец.",
        time: "выходные",
        status: "call",
        managerNote: "",
      },
      {
        id: "L-1004",
        createdAt: "2026-11-12T10:00:00.000Z",
        name: "Павел Нестеров",
        phone: "+7 999 312-77-05",
        email: "",
        type: "waitlist",
        apartmentId: "202",
        message: "Хотел 202, она занята. Предложили 204 и 302.",
        time: "будни, 10–13",
        status: "lost",
        managerNote: "Ушёл думать, не перезванивать до декабря.",
      },
      {
        id: "L-1005",
        createdAt: "2026-11-07T15:40:00.000Z",
        name: "Кирилл Орлов",
        phone: "+7 926 555-19-08",
        email: "orlov.k@yandex.ru",
        type: "booking",
        apartmentId: "703",
        message: "Хочет заехать в декабре на год. Ждёт договор аренды.",
        time: "будни, 13–17",
        status: "reserved",
        managerNote: "Договор на год, залог — месяц.",
      },
    ],
    feedLog: [
      {
        id: "F-1",
        at: "2026-11-18T07:00:00.000Z",
        target: "pull-yandex",
        count: 31,
        note: "Плановое чтение фида",
      },
    ],
    events: [
      { at: "2026-11-18T07:10:00.000Z", text: "Фид Яндекс Недвижимости отдан в кабинет, 31 квартира." },
      { at: "2026-11-07T15:45:00.000Z", text: "Кирилл Орлов забронировал 703." },
    ],
  };
}
