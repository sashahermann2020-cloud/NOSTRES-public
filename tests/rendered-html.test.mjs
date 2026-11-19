import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Немецкие термины размечаются <span lang="de"> (app/german-runs.tsx); для проверки текста разметка снимается.
const plain = (html) => html.replace(/<span lang="de">([^<]*)<\/span>/g, "$1");

test("renders the Berlin MVP and official routes", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = plain(await response.text());
  assert.match(html, /NOSTRES: что делать после переезда/);
  assert.match(html, /Бесплатные пошаговые маршруты после переезда в Берлин: документы, жильё, здоровье, работа, семья, пособия, транспорт и животные/);
  assert.match(html, /NOSTRES помогает выстроить понятную последовательность дел после переезда/);
  assert.match(html, /Проверяем источники и показываем следующий шаг/);
  assert.match(html, /Трудно прийти в ведомство или звонить/);
  assert.match(html, /Как помогает NOSTRES/);
  assert.match(html, /Маршруты по вашей задаче/);
  assert.match(html, /Найдено(<!-- -->)?\s*(<!-- -->)?\s*57/);
  assert.match(html, /Платных специалистов в первой версии нет/);
  assert.match(html, /Пятьдесят семь самостоятельных маршрутов/);
  for (const path of ["pereezd-v-germaniyu", "chancenkarte", "viza-rabota", "viza-volontyor", "viza-uchyoba"]) assert.match(html, new RegExp(`/berlin/${path}`));
  assert.match(html, /\/berlin\/transport-tickets/);
  assert.match(html, /\/berlin\/culture-discounts/);
  assert.match(html, /\/berlin\/wohnungssuche/);
  assert.match(html, /\/berlin\/aufenthalt/);
  assert.match(html, /\/berlin\/vrach/);
  assert.match(html, /\/berlin\/srochnaya-pomoshch/);
  assert.match(html, /\/berlin\/samostoyatelnaya-rabota/);

  const aboutResponse = await worker.fetch(
    new Request("http://localhost/about", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(aboutResponse.status, 200);
  const aboutHtml = plain(await aboutResponse.text());
  assert.match(aboutHtml, /Зачем нужен NOSTRES/);
  assert.match(aboutHtml, /банковские услуги/);
  assert.match(aboutHtml, /мобильную связь/);
  assert.match(aboutHtml, /Маршруты по другим городам пока не опубликованы/);
  assert.match(aboutHtml, /первый город Берлин/);
  assert.match(aboutHtml, /ограниченной мобильности/);
  assert.match(aboutHtml, /объяснять причину и называть диагноз не нужно/i);
  assert.match(aboutHtml, /Steuer-ID/);
  assert.match(html, /service\.berlin\.de/);
  assert.doesNotMatch(html, /Турин/);
  assert.match(html, /Понятный путь после переезда · первый город Берлин/);
  assert.doesNotMatch(html, /ВНЖ, Steuer-ID, медицине и бизнесу/);

  const homeSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(homeSource, /publishedJourneys\.filter/);
  assert.match(homeSource, /publishedCategories/);

  const routeData = await readFile(new URL("../app/nostres-data.ts", import.meta.url), "utf8");
  assert.match(routeData, /serviceportal\.gemeinsamonline\.de/);
  assert.match(routeData, /до 3 рабочих дней/);
  assert.match(routeData, /anmeldung-personal/);
  assert.match(routeData, /termin\/all\/120686/);
  assert.match(routeData, /Что такое eID и как подготовить её/);
  assert.match(routeData, /3–4 недели/);

  const routeResponse = await worker.fetch(
    new Request("http://localhost/berlin/anmeldung", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(routeResponse.status, 200);
  const routeHtml = plain(await routeResponse.text());
  assert.match(routeHtml, /Anmeldung/);
  assert.match(routeHtml, /Есть ли у вас сейчас регистрация/);
  assert.doesNotMatch(routeHtml, /СРОК ПОДАЧИ/);
  assert.match(routeHtml, /Получить персональный маршрут/);
  assert.match(routeHtml, /Anmeldung \(регистрация места жительства\)/);
  assert.doesNotMatch(routeHtml, /Все официальные источники и даты проверки/);
  assert.match(routeHtml, /Meldebestätigung/);

  const taxRouteResponse = await worker.fetch(
    new Request("http://localhost/berlin/steuer-id", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(taxRouteResponse.status, 200);
  const taxRouteHtml = plain(await taxRouteResponse.text());
  assert.match(taxRouteHtml, /Steuer-ID/);
  assert.match(taxRouteHtml, /Что сейчас известно о вашей Steuer-ID/);
  assert.match(taxRouteHtml, /Получить персональный маршрут/);
  assert.doesNotMatch(taxRouteHtml, /Все официальные источники и даты проверки/);

  const healthRouteResponse = await worker.fetch(
    new Request("http://localhost/berlin/health-insurance", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(healthRouteResponse.status, 200);
  const healthRouteHtml = plain(await healthRouteResponse.text());
  assert.match(healthRouteHtml, /Krankenversicherung/);
  assert.match(healthRouteHtml, /Какая страховка действует сейчас/);
  assert.match(healthRouteHtml, /Получить персональный маршрут/);
  assert.doesNotMatch(healthRouteHtml, /Все официальные источники и даты проверки/);

  const housingResponse = await worker.fetch(
    new Request("http://localhost/berlin/wohnungssuche", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(housingResponse.status, 200);
  const housingHtml = plain(await housingResponse.text());
  assert.match(housingHtml, /Wohnungssuche/);
  assert.match(housingHtml, /Есть ли у вас документ SCHUFA/);
  assert.match(housingHtml, /Получить маршрут/);
  assert.doesNotMatch(housingHtml, /Искать квартиры городских компаний/);

  const leaResponse = await worker.fetch(
    new Request("http://localhost/berlin/aufenthalt", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(leaResponse.status, 200);
  const leaHtml = plain(await leaResponse.text());
  assert.match(leaHtml, /Aufenthaltstitel/);
  assert.match(leaHtml, /Где находится ваш основной зарегистрированный адрес/);
  assert.doesNotMatch(leaHtml, /Что указано как основание нынешнего вида/);
  assert.match(leaHtml, /Получить маршрут/);
  assert.doesNotMatch(leaHtml, /Перейти прямо к онлайн-форме/);

  for (const [path, heading, firstQuestion] of [
    ["/berlin/vrach", /Arztsuche/, /Как вы сейчас застрахованы/],
    ["/berlin/srochnaya-pomoshch", /Notfall/, /Есть ли признаки угрозы жизни/],
    ["/berlin/samostoyatelnaya-rabota", /Gewerbe или Freiberuf/, /Где будет постоянное место/],
    ["/berlin/bank", /Girokonto/, /Что вам нужно/],
    ["/berlin/svyaz", /Mobilfunk и Internet/, /Что вам нужно/],
    ["/berlin/sobaka/marshrut", /Hund/, /Что вам нужно сделать/],
    ["/berlin/kindergeld", /Kindergeld/, /Что вам нужно/],
    ["/berlin/jobcenter", /Agentur für Arbeit и Jobcenter/, /Что вам нужно/],
    ["/berlin/kita-schule", /Kita, Schule und Geburt/, /Что вам нужно/],
    ["/berlin/rabota-po-najmu", /Stellensuche/, /Что вам нужно/],
    ["/berlin/elterngeld", /Elterngeld/, /На каком вы этапе/],
    ["/berlin/kinderzuschlag", /Kinderzuschlag/, /Получаете ли вы Kindergeld/],
    ["/berlin/steuererklaerung", /Einkommensteuererklärung/, /Какой у вас доход/],
    ["/berlin/elternzeit", /Elternzeit/, /Работаете ли вы по найму/],
    ["/berlin/wohngeld", /Wohngeld/, /снимаете жильё или владеете/],
    ["/berlin/mutterschutz", /Mutterschutz und Mutterschaftsgeld/, /Какой у вас статус до родов/],
    ["/berlin/bildungspaket", /Bildungs- und Teilhabepaket/, /Какое пособие получает семья/],
    ["/berlin/pflegegeld", /Pflegegeld und Pflegegrad/, /Кому нужен уход/],
    ["/berlin/schwerbehinderung", /Schwerbehindertenausweis/, /На каком вы этапе/],
    ["/berlin/wohnungsgeber", /Wohnungsgeberbestätigung/, /Кто вы/],
    ["/berlin/umzug", /Umzug/, /Откуда вы переезжаете/],
    ["/berlin/arbeitslosengeld", /Arbeitslosengeld/, /Сколько месяцев вы платили взносы/],
    ["/berlin/grundsicherungsgeld", /Grundsicherungsgeld/, /Для кого заявление/],
    ["/berlin/kfz-ummeldung", /Kfz-Ummeldung/, /Откуда вы переехали/],
    ["/berlin/einbuergerung", /Einbürgerung/, /Сколько вы законно живёте/],
    ["/berlin/aufenthalt-rabota", /Aufenthaltstitel/, /Где вы сейчас/],
    ["/berlin/anerkennung", /Anerkennung/, /Какая у вас профессия/],
    ["/berlin/integrationskurs", /Integrationskurs/, /Какой у вас статус/],
    ["/berlin/familiennachzug", /Familiennachzug/, /Кто уже живёт в Германии/],
    ["/berlin/sprachkurs", /Sprachkurs/, /Какой язык вы хотите учить/],
    ["/berlin/pereezd-s-zhivotnym", /Переезд с животным/, /Какое животное переезжает с вами/],
    ["/berlin/heimtierausweis", /Heimtierausweis/, /Для какого животного нужен паспорт/],
    ["/berlin/veterinar", /Tierarzt/, /Что сейчас нужно/],
    ["/berlin/dressirovka", /Hundeschule/, /Что вам нужно/],
    ["/berlin/studium-ausbildung", /Studienkolleg/, /Куда вы хотите поступить/],
    ["/berlin/transport-tickets", /Билеты на общественный транспорт Берлина/, /Кто будет пользоваться билетом/],
    ["/berlin/culture-discounts", /Льготы на культуру и досуг в Берлине/, /Кому нужна льгота/],
    ["/berlin/pereezd-v-germaniyu", /Переезд в Германию/, /Какое у вас гражданство/],
    ["/berlin/chancenkarte", /Chancenkarte/, /Какое у вас образование/],
    ["/berlin/viza-rabota", /Blue Card/, /трудовой договор или письменное предложение/],
    ["/berlin/viza-volontyor", /волонт/, /Какая служба вас интересует/],
    ["/berlin/viza-uchyoba", /Ausbildung/, /Какая у вас цель/],
    ["/berlin/notar", /Notar/, /Для чего вам нужен нотариус/],
    ["/berlin/psihicheskoe-zdorovye", /<span lang="de">Psychische Gesundheit<\/span>/, /Мне плохо прямо сейчас/],
    ["/berlin/niederlassungserlaubnis", /Niederlassungserlaubnis/, /На каком основании у вас сейчас вид на жительство/],
    ["/berlin/sozialversicherungsnummer", /Sozialversicherungsnummer/, /Какой номер вам нужен/],
    ["/berlin/gmbh-ug", /GmbH или UG/, /На каком вы этапе/],
  ]) {
    const response = await worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
    assert.equal(response.status, 200, path);
    const raw = await response.text();
    const page = plain(raw);
    assert.match(heading.source.includes("lang=") ? raw : page, heading);
    assert.match(page, firstQuestion);
    assert.match(page, /Получить маршрут/);
    assert.doesNotMatch(page, /Что делать по порядку/);
    assert.doesNotMatch(page, /пользовател/i);
  }

  const journeyUi = await readFile(new URL("../app/berlin/anmeldung/AnmeldungJourney.tsx", import.meta.url), "utf8");
  assert.match(journeyUi, /questionnaireSubmitted/);
  assert.match(journeyUi, /Получить персональный маршрут/);
  assert.match(journeyUi, /AOK Nordost/);
  assert.match(journeyUi, /Techniker Krankenkasse/);
  assert.match(journeyUi, /BARMER/);
  assert.match(journeyUi, /Письменный контакт/);

  const testPageResponse = await worker.fetch(
    new Request("http://localhost/mvp-test", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
  assert.equal(testPageResponse.status, 200);
  const testPageHtml = plain(await testPageResponse.text());
  assert.match(testPageHtml, /Помогите проверить, доводит ли NOSTRES до действия/);
  assert.match(testPageHtml, /Один маршрут за один тест/);
  assert.ok(testPageHtml.includes("/berlin/wohnungssuche"));
  assert.ok(testPageHtml.includes("/berlin/vrach"));
  assert.ok(testPageHtml.includes("/berlin/srochnaya-pomoshch"));
  assert.ok(testPageHtml.includes("/berlin/samostoyatelnaya-rabota"));
  for (const [route, page] of [["главная", html], ["регистрация", routeHtml], ["налоговый номер", taxRouteHtml], ["страховка", healthRouteHtml], ["жильё", housingHtml], ["ВНЖ", leaHtml], ["тест", testPageHtml]]) {
    assert.doesNotMatch(page, /пользовател/i, `${route}: не называйте читателя пользователем`);
  }


  const previewRobotsResponse = await worker.fetch(
    new Request("https://nostres-preview.workers.dev/robots.txt", { headers: { accept: "text/plain" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(previewRobotsResponse.status, 200);
  assert.equal(previewRobotsResponse.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.match(await previewRobotsResponse.text(), /Disallow: \/\n/);

  const productionRobotsResponse = await worker.fetch(
    new Request("https://nostres.world/robots.txt", { headers: { accept: "text/plain" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(productionRobotsResponse.status, 200);
  assert.equal(productionRobotsResponse.headers.get("X-Robots-Tag"), null);
  assert.match(await productionRobotsResponse.text(), /Sitemap: https:\/\/nostres\.world\/sitemap\.xml/);

  const eventRoute = await readFile(new URL("../app/api/mvp-events/route.ts", import.meta.url), "utf8") + await readFile(new URL("../app/api/mvp-events/rules.ts", import.meta.url), "utf8");
  assert.match(eventRoute, /INSERT INTO product_events/);
  assert.match(eventRoute, /INSERT INTO issue_reports/);
  assert.match(eventRoute, /INSERT INTO route_feedback/);
  assert.match(eventRoute, /route_feedback_submitted/);
  assert.match(eventRoute, /"tax-id"/);
  assert.match(eventRoute, /"health"/);
  assert.doesNotMatch(eventRoute, /payload\.(answers|email|documents)/i);
});
