import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROUTE_THEMES, THEMES, inTheme, themeOf } from "../app/route-themes.ts";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const pageIds = [...page.matchAll(/inTheme\("([^"]+)", category\)/g)].map((m) => m[1]);
const published = [...page.matchAll(/^  ("?[\w-]+"?): "\/berlin\//gm)].map((m) => m[1].replaceAll('"', ""));

test("у каждого маршрута главной есть тема, и карточка стоит в своей основной теме", () => {
  assert.equal(pageIds.length, 50);
  for (const id of [...pageIds, ...published]) assert.ok(ROUTE_THEMES[id], `нет темы для ${id}`);
  for (const id of pageIds) assert.match(page, new RegExp(`data-cat=\\{themeOf\\("${id}"\\)\\}`), id);
  assert.equal(Object.keys(ROUTE_THEMES).length, pageIds.length + published.length);
});

test("темы: только из списка, в каждом разделе не меньше двух маршрутов", () => {
  const count = Object.fromEntries(THEMES.map((t) => [t, 0]));
  for (const { primary, also = [] } of Object.values(ROUTE_THEMES)) {
    assert.ok(THEMES.includes(primary));
    also.forEach((t) => assert.ok(THEMES.includes(t) && t !== primary));
    count[primary] += 1;
  }
  for (const t of THEMES) assert.ok(count[t] >= 2, `${t}: ${count[t]}`);
  assert.equal(themeOf("transport"), "Транспорт и досуг");
  assert.equal(themeOf("culture"), "Транспорт и досуг");
  assert.ok(inTheme("culture", "Семья и дети") && inTheme("transport", "Пособия и льготы"));
  assert.ok(!inTheme("transport", "Учёба и язык") && !inTheme("culture", "Учёба и язык"));
});

test("пособия отделены от банка и связи, фильтр учитывает дополнительные темы", () => {
  for (const id of ["kindergeld", "kinderzuschlag", "elterngeld", "bildungspaket", "wohngeld", "pflegegeld", "arbeitslosengeld", "grundsicherungsgeld"]) assert.equal(themeOf(id), "Пособия и льготы", id);
  assert.deepEqual(Object.keys(ROUTE_THEMES).filter((id) => themeOf(id) === "Банк и связь").sort(), ["bank", "telecom"]);
  assert.equal(themeOf("kita"), "Семья и дети");
  assert.ok(inTheme("kindergeld", "Семья и дети") && inTheme("kindergeld", "Все") && !inTheme("kindergeld", "Банк и связь"));
});

test("переезд до въезда отделён от документов в Германии, автомобиль — в транспорте", () => {
  for (const id of ["relocation", "chancenkarte", "workvisa", "studyvisa", "volunteer", "reunion", "petmove"]) assert.equal(themeOf(id), "Переезд в Германию", id);
  for (const id of ["anmeldung", "lea", "workpermit", "einbuergerung"]) assert.equal(themeOf(id), "Документы и статус", id);
  assert.equal(themeOf("kfz"), "Транспорт и досуг");
  assert.ok(inTheme("petmove", "Животные") && inTheme("reunion", "Семья и дети") && inTheme("kfz", "Документы и статус"));
  assert.equal(THEMES[0], "Переезд в Германию");
});
