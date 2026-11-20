import { digitsPhone, roomsLong, xmlEscape } from "./format";
import type { Apartment, Settings } from "./types";

export function exportable(apartments: Apartment[], settings: Settings) {
  return apartments.filter((item) => {
    if (item.status === "available") return true;
    if (item.status === "reserved") return settings.exportReserved;
    return settings.exportSold;
  });
}

function description(apartment: Apartment, settings: Settings) {
  return [
    `${roomsLong(apartment.rooms)} ${apartment.area.toLocaleString("ru-RU")} м², ${apartment.floor} этаж из 9.`,
    `ЖК «${settings.complexName}», ${settings.address}. Вид: ${apartment.view}. Отделка: ${apartment.finishing}. Потолки ${apartment.ceiling.toLocaleString("ru-RU")} м.`,
    apartment.blurb,
    "Продажа от застройщика, ДДУ, расчёты через эскроу. Ключи — II квартал 2027.",
  ].join(" ");
}

export function yandexFeed(apartments: Apartment[], settings: Settings, site: string) {
  const offers = exportable(apartments, settings)
    .map((apartment) => {
      const rooms = apartment.rooms <= 0 ? 1 : apartment.rooms;
      const images = [
        `${site}/plans/${apartment.id}.svg`,
        ...apartment.photoUrls.filter(Boolean),
      ];
      const coords =
        settings.latitude && settings.longitude
          ? `<latitude>${xmlEscape(settings.latitude)}</latitude><longitude>${xmlEscape(settings.longitude)}</longitude>`
          : "";
      return `<offer internal-id="${xmlEscape(apartment.id)}">
        <type>продажа</type>
        <property-type>жилая</property-type>
        <category>квартира</category>
        <url>${xmlEscape(`${site}/apartments/${apartment.id}`)}</url>
        <creation-date>${apartment.createdAt}</creation-date>
        <last-update-date>${apartment.updatedAt}</last-update-date>
        <location>
          <country>Россия</country>
          <locality-name>${xmlEscape(settings.city)}</locality-name>
          <sub-locality-name>${xmlEscape(settings.district)}</sub-locality-name>
          <address>${xmlEscape(settings.address)}</address>
          <apartment>${xmlEscape(apartment.id)}</apartment>
          ${coords}
        </location>
        <price><value>${apartment.price}</value><currency>RUR</currency></price>
        <sales-agent>
          <name>${xmlEscape(settings.salesName)}</name>
          <phone>${xmlEscape(settings.phoneDisplay)}</phone>
          <category>застройщик</category>
          <organization>${xmlEscape(settings.developer)}</organization>
          <email>${xmlEscape(settings.email)}</email>
        </sales-agent>
        <floor>${apartment.floor}</floor>
        <floors-total>9</floors-total>
        <building-name>ЖК «${xmlEscape(settings.complexName)}»</building-name>
        <built-year>2027</built-year>
        <ready-quarter>2</ready-quarter>
        <building-state>unfinished</building-state>
        <rooms>${rooms}</rooms>
        ${apartment.rooms <= 0 ? "<studio>1</studio>" : ""}
        <new-flat>1</new-flat>
        <deal-status>первичная продажа</deal-status>
        <area><value>${apartment.area}</value><unit>кв. м</unit></area>
        <description>${xmlEscape(description(apartment, settings))}</description>
        ${images.map((url) => `<image>${xmlEscape(url)}</image>`).join("")}
      </offer>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<realty-feed xmlns="http://webmaster.yandex.ru/schemas/feed/realty/2010-06">
  <generation-date>${new Date().toISOString()}</generation-date>
  ${offers}
</realty-feed>`;
}

export function avitoFeed(apartments: Apartment[], settings: Settings, site: string) {
  const ads = exportable(apartments, settings)
    .map((apartment) => {
      const images = [`${site}/plans/${apartment.id}.svg`, ...apartment.photoUrls.filter(Boolean)];
      const rooms = apartment.rooms <= 0 ? "Студия" : String(apartment.rooms);
      const dev = settings.newDevelopmentId
        ? `<NewDevelopmentId>${xmlEscape(settings.newDevelopmentId)}</NewDevelopmentId>`
        : "";
      return `<Ad>
        <Id>${xmlEscape(apartment.id)}</Id>
        <Category>Квартиры</Category>
        <OperationType>Продам</OperationType>
        <MarketType>Новостройка</MarketType>
        ${dev}
        <Status>Квартира</Status>
        <HouseType>Кирпичный</HouseType>
        <Rooms>${rooms}</Rooms>
        <Square>${apartment.area}</Square>
        <Floor>${apartment.floor}</Floor>
        <Floors>9</Floors>
        <Price>${apartment.price}</Price>
        <CompanyName>${xmlEscape(settings.developer)}</CompanyName>
        <ContactPhone>${digitsPhone(settings.phone)}</ContactPhone>
        <Address>${xmlEscape(`${settings.city}, ${settings.district}, ${settings.address}`)}</Address>
        <Description>${xmlEscape(description(apartment, settings))}</Description>
        <Images>
          ${images.map((url) => `<Image url="${xmlEscape(url)}"/>`).join("")}
        </Images>
      </Ad>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Ads formatVersion="3" target="Avito.ru">
  ${ads}
</Ads>`;
}

export function feedWarnings(apartments: Apartment[], settings: Settings) {
  const warnings: string[] = [];
  const list = exportable(apartments, settings);
  if (!settings.newDevelopmentId) {
    warnings.push("Для Авито не задан NewDevelopmentId. Без него кабинет новостроек объявления не примет — номер берётся в поддержке Авито.");
  }
  if (!digitsPhone(settings.phone).startsWith("7")) {
    warnings.push("Телефон для фида должен быть российским, начиная с 7.");
  }
  const noPhoto = list.filter((item) => item.photoUrls.length === 0).length;
  if (noPhoto) {
    warnings.push(
      `${noPhoto} квартир без JPG. В фид уходит чертёж SVG. Если кабинет требует фотографию, добавьте ссылки в карточке.`,
    );
  }
  const bad = list.filter((item) => item.price <= 0 || item.area <= 0);
  if (bad.length) warnings.push(`У ${bad.map((item) => item.id).join(", ")} пустая цена или площадь — строка уйдёт бракованной.`);
  if (!list.length) warnings.push("В выгрузку не попала ни одна квартира. Проверьте фильтр статусов.");
  return warnings;
}
