import type { Action, Answers, Method, Plan, Provider, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

export const everydayOfficial = {
  basiskonto: "https://www.bafin.de/DE/verbraucherinnen-verbraucher/themen-finanzprodukte/konten-zahlungen/konten/basiskonto/basiskonto_node.html",
  gwgIdent: "https://www.gesetze-im-internet.de/gwg_2017/__12.html",
  videoident: "https://www.bafin.de/SharedDocs/Veroeffentlichungen/DE/Rundschreiben/2017/rs_1703_gw_videoident.html",
  ingGiro: "https://www.ing.de/girokonto/",
  ingFaq: "https://www.ing.de/girokonto/kundenservice/",
  n26Open: "https://n26.com/de-de/konto-eroeffnen",
  n26Id: "https://support.n26.com/de-de/konto-und-personliche-informationen/verifizierung-meiner-identitat/wie-kann-ich-mich-ausweisen",
  revolutStart: "https://help.revolut.com/en-DE/help/profile-and-plan/getting-started-with-revolut/",
  revolutVerify: "https://help.revolut.com/en-DE/help/profile-and-plan/profile-plan/verifying-identity/how-do-i-verify-my-identity/",
  revolutFees: "https://www.revolut.com/de-DE/legal/standard-fees/",
  vividDocs: "https://support.vivid.money/en/articles/8675870-which-documents-can-i-use-to-confirm-my-identity",
  vividOpen: "https://support.vivid.money/en/articles/8460178-how-can-i-open-an-account",
  vividFees: "https://website-static.vivid.money/static/legal-docs/de-de/fees-for-retail-users-vivid-money-sa.pdf",
  dkbBasis: "https://www.dkb.de/fragen-antworten/was-muss-ich-zum-basiskonto-wissen",
  sparkasseBasis: "https://www.berliner-sparkasse.de/de/home/privatkunden/girokonto/girokonto-basis.html",
  sparkasseForm: "https://www.berliner-sparkasse.de/content/dam/myif/berliner-sk/work/dokumente/pdf/allgemein/antrag-auf-abschluss-eines-basiskontovertrags.pdf?n=true",
  sparkassePrice: "https://www.berliner-sparkasse.de/content/dam/myif/berliner-sk/work/dokumente/pdf/preise-leistungen/entgeltinformation-giro-digital-basis.pdf?n=true",
  commerzbankBasis: "https://www.commerzbank.de/privatkunden/girokonten/basiskonto/",
  commerzbankForm: "https://www.commerzbank.de/portal/media/efw-dokumente/antrag_basiskonto.pdf",
  postbankForm: "https://www.postbank.de/dam/postbank/pdf/privatkunden/konten/Postbank-Giro-Basis-Antrag-921-000-006-1126.pdf",
  postbankPrice: "https://www.postbank.de/dam/postbank/pdf/privatkunden/konten/Postbank-Giro-Basis-Entgeltinformation-923-960-083-1126.pdf",
  girokonto: "https://www.bafin.de/DE/verbraucherinnen-verbraucher/themen-finanzprodukte/konten-zahlungen/konten/girokonto/girokonto_node.html",
  basiskontoForm: "https://www.bafin.de/SharedDocs/Downloads/DE/Formular/dl_fo_basiskonto_antrag_abschluss.pdf?__blob=publicationFile&v=1",
  basiskontoProcedureForm: "https://www.bafin.de/SharedDocs/Downloads/DE/Formular/dl_fo_basiskonto_antrag_verwaltungsverfahren.pdf?__blob=publicationFile&v=1",
  basiskontoNewcomers: "https://www.verbraucherzentrale.de/wissen/geld-versicherungen/sparen-und-anlegen/das-recht-auf-ein-basiskonto-fuer-neu-in-deutschland-angekommene-12224",
  bafinArbitration: "https://www.bafin.de/DE/verbraucherinnen-verbraucher/hilfe-kontakt/beschwerden-streitschlichtung/streit-bei-bafin-schlichten/streit-bei-bafin-schlichten_node.html",
  telecomContracts: "https://www.bundesnetzagentur.de/DE/Vportal/TK/InternetTelefon/Vertrag/start.html",
  telecomRights: "https://www.bundesnetzagentur.de/DE/Vportal/TK/NeueKundenrechte/start.html",
  telecomIdLaw: "https://www.gesetze-im-internet.de/tkg_2021/__172.html",
  telecomIdBna: "https://www.bundesnetzagentur.de/DE/Fachthemen/Telekommunikation/OeffentlicheSicherheit/IdentverfahrenPrepaid/artikel.html",
  vodafoneCallya: "https://www.vodafone.de/cy-reg/",
  vodafoneOrder: "https://www.vodafone.de/hilfe/bestellen.html",
  o2Activate: "https://www.o2online.de/service/sim-karte-aktivieren/",
  o2Faq: "https://hilfe.o2online.de/o2-prepaid-128/wie-aktiviere-ich-meine-o2-prepaid-sim-karte-648460",
  alditalkRegister: "https://www.alditalk.de/registrieren",
  alditalkFaq: "https://www.alditalk.de/faq",
  alditalkStarter: "https://www.alditalk.de/starter-set-basis-tarif",
  telekomPhone: "https://www.telekom.de/shop/tarife/handyvertrag",
  o2Unlimited: "https://www.o2online.de/e-shop/tarif/o2-mobile-unlimited-m",
  oneUnlimited: "https://mobile.1und1.de/unbegrenztes-datenvolumen",
  funkApp: "https://www.freenet-funk.de/",
  vodafoneUnlimited: "https://www.vodafone.de/privat/handys-tablets-tarife/unbegrenztes-datenvolumen.html",
  vodafoneHome: "https://www.vodafone.de/privat/internet.html",
  o2HomeSpot: "https://www.o2online.de/internet-festnetz/homespot-tarife/",
  o2Dsl: "https://www.o2online.de/internet-festnetz/dsl-tarife/",
  telecomConsumerRights: "https://www.verbraucherzentrale.de/wissen/digitale-welt/mobilfunk-und-festnetz/wichtige-kundenrechte-fuer-telefon-handy-und-internetvertraege-65879",
  telecomSwitching: "https://www.verbraucherzentrale.de/wissen/digitale-welt/mobilfunk-und-festnetz/telefon-oder-internetanbieterwechsel-hoechstens-ein-tag-ohne-leitung-11248",
  telecomArbitration: "https://www.bundesnetzagentur.de/DE/Vportal/Schlichtung/Schlichtung_TK/Fallbeispiele/artikel.html",
  wbsService: "https://service.berlin.de/dienstleistung/120671/",
  wbsOnline: "https://liste-antraege.bda.service.berlin.de/intelliform/forms/default/bda/SenSBW/wbs/index?vt=wbs",
  wbsCalc: "https://www.berlin.de/sen/wohnen/service/wohnberechtigungsschein/",
  wbsCheck: "https://www.berlin.de/sen/wohnen/service/wohnberechtigungsschein/",
  wbsForm: "https://www.berlin.de/sen/stadt/_assets/service/formular-center/bereich-wohnen/bauwohn502.pdf",
  wbsWelcome: "https://willkommenszentrum.berlin.de/en/housing/wbs-certificate-eligibility-subsidized-housing",
  dogRegister: "https://service.berlin.de/dienstleistung/330785/",
  dogTax: "https://service.berlin.de/dienstleistung/121494/",
  dogFaq: "https://www.berlin.de/sen/verbraucherschutz/aufgaben/hundehaltung/artikel.1485419.php",
  dogListed: "https://service.berlin.de/dienstleistung/326263/",
  dogLeash: "https://service.berlin.de/dienstleistung/121822/",
  dogDistrict: "https://www.berlin.de/ba-spandau/politik-und-verwaltung/aemter/ordnungsamt/veterinaer-und-lebensmittelueberwachung/veterinaeraufsicht-hundegesetz-berlin-bezirksamt-spandau-1345055.php",
  dogExperts: "https://www.berlin.de/sen/verbraucherschutz/aufgaben/hundehaltung/anerkannte-sachverstaendige/",
  ordnungsaemter: "https://service.berlin.de/standorte/ordnungsaemter/",
  dogAreas: "https://www.berlin.de/forsten/walderlebnis/hundeauslauf-im-wald/",
};
const o = everydayOfficial;

export const bankQuestions = [
  q("goal", "Что вам нужно?", [["open", "Открыть счёт в Германии: сейчас у меня нет немецкого счёта"], ["another", "Открыть ещё один счёт или счёт в другом банке: немецкий счёт у меня уже есть"], ["refused", "Банк отказал мне в открытии счёта"]]),
  q("id", "Какой у вас документ, удостоверяющий личность?", [
    ["de", "Паспорт или удостоверение личности Германии"],
    ["eu", "Паспорт или удостоверение личности страны ЕС/ЕЭЗ"],
    ["foreign", "Паспорт страны вне ЕС/ЕЭЗ"],
    ["authority", "Немецкий документ ведомства: Aufenthaltsgestattung, Duldung или Ankunftsnachweis"],
    ["ukraine", "Украинский документ и немецкая справка ведомства: Anlaufbescheinigung, Fiktionsbescheinigung или Meldebescheinigung"],
    ["fiction", "Только Fiktionsbescheinigung"],
    ["none", "Подходящего документа пока нет или срок действия истёк"],
    ["unknown", "Не знаю, подойдёт ли мой документ"],
  ]),
  q("address", "Есть ли у вас постоянный адрес в Германии?", [["yes", "Да"], ["no", "Пока нет"]]),
] as const;

export const telecomQuestions = [
  q("need", "Что вам нужно?", [["new", "Заключить договор на мобильную связь или интернет"], ["switch", "Сменить провайдера или перевезти услугу на новый адрес"], ["cancel", "Расторгнуть договор или проверить его срок"], ["problem", "Проблема: скорость, сбой связи, изменение условий"]]),
  q("issue", "Что именно случилось?", [["speed", "Скорость заметно ниже обещанной"], ["outage", "Нет связи или не пришёл мастер"], ["change", "Провайдер изменил условия или цену"]]),
  q("product", "Что именно вам нужно подключить?", [["mobile", "Мобильная связь для телефона (SIM-карта или eSIM)"], ["unlimited", "Мобильная связь с безлимитным интернетом (SIM-карта или eSIM)"], ["home", "Интернет дома"]]),
] as const;

export const dogQuestions = [
  q("stage", "Что вам нужно сделать?", [["new", "Собака у меня появилась или переезжает со мной в Берлин"], ["move", "Собака уже в берлинском реестре, у меня новый адрес"], ["ended", "Собаки больше нет у меня: умерла, потеряна или передана"], ["unsure", "Не знаю, внесена ли собака в реестр"]]),
  q("breed", "Это Pit Bull Terrier, American Staffordshire Terrier, Bull Terrier или помесь с одной из этих пород?", [["no", "Нет"], ["yes", "Да, или помесь"], ["unsure", "Не знаю"]]),
  q("leash", "Хотите освободить собаку от общего правила о поводке?", [["no", "Нет, достаточно общих правил"], ["yes", "Да, хочу узнать порядок"]]),
] as const;

export const wbsQuestions = [
  q("status", "Какой у вас статус пребывания?", [["eu", "Гражданин Германии или страны ЕС"], ["permit", "Гражданин другой страны, вид на жительство действует не меньше года"], ["short", "Гражданин другой страны, вид на жительство действует меньше года"], ["none", "Вида на жительство пока нет"], ["unknown", "Не знаю"]]),
  q("stay", "Собираетесь жить в Берлине не меньше 11 месяцев?", [["yes", "Да"], ["no", "Нет, на более короткий срок"], ["unknown", "Не знаю"]]),
  q("household", "Для кого вы подаёте заявление?", [["alone", "Для себя одного(одной)"], ["family", "Для семьи или пары"], ["wg", "Для квартиры совместного проживания (WG) с соседями"]]),
] as const;

export function questionsForEveryday(id: "bank" | "telecom" | "dog" | "wbs", a: Answers): readonly Question[] {
  if (id === "wbs") {
    if (a.status === "none" || a.status === "short") return wbsQuestions.slice(0, 1);
    if (!a.status) return wbsQuestions.slice(0, 1);
    if (a.stay === "no") return wbsQuestions.slice(0, 2);
    return wbsQuestions;
  }
  if (id === "bank") {
    if (a.goal !== "open" && a.goal !== "another") return [bankQuestions[0]];
    if (!a.id || a.id === "fiction" || a.id === "none" || a.id === "unknown") return bankQuestions.slice(0, 2);
    return bankQuestions;
  }
  if (id === "telecom") {
    if (a.need === "problem") return [telecomQuestions[0], telecomQuestions[1]];
    if (a.need === "new") return [telecomQuestions[0], telecomQuestions[2]];
    return [telecomQuestions[0]];
  }
  if (a.stage === "move" || a.stage === "ended" || !a.stage) return [dogQuestions[0]];
  if (a.breed !== "no") return dogQuestions.slice(0, 2);
  return dogQuestions;
}


const providerPrice = (value: string) => ({ label: "Стоимость Basiskonto", value, kind: "provider" as const });
const bankProviders: Record<"remote" | "branch", Provider[]> = {
  remote: [
    {
      id: "dkb", name: "DKB", label: "Basiskonto · онлайн-заявление",
      summary: "Банк без отделений. Заявление на Basiskonto заполняется онлайн, затем его нужно распечатать, подписать и отправить в банк. Способ проверки личности вы выбираете из перечисленных на титульном листе формы: страница DKB их не называет.",
      facts: [{ label: "Проверка личности и срок", value: "Обычный счёт: видеозвонок WebID занимает несколько минут, доступен с 7:00 до 22:00, нужен действующий немецкий Personalausweis или Reisepass (временные документы не принимаются). Для Basiskonto способ проверки указан на титульном листе формы", kind: "provider" }, { label: "Стоимость Basiskonto", value: "указана в прейскуранте банка «Preis- und Leistungsverzeichnis – Konten»; на странице о Basiskonto суммы нет", kind: "none" }],
      conditions: ["Законное пребывание в ЕС и возраст от 18 лет", "Нет платёжного счёта ни в DKB, ни в другом банке", "Счёт только для личного использования", "Документы и способы проверки личности указаны на титульном листе формы: прочитайте его до подачи"],
      links: [act("DKB: что нужно знать о Basiskonto", o.dkbBasis)],
    },
    {
      id: "ing", name: "ING", label: "Basiskonto или обычный счёт · проверка онлайн",
      summary: "Банк без отделений: личность проверяют один раз, на выбор через PostIdent, видеозвонок или онлайн-функцию удостоверения eID. Список принимаемых документов на странице ING не приведён. ING называет Basiskonto счётом для людей без постоянного места жительства и просителей убежища.",
      facts: [{ label: "Проверка личности и срок", value: "видеочат или онлайн-функция удостоверения eID, а также PostIdent в Deutsche Post (он занимает больше времени). Фиксированного срока нет: счёт создаётся после завершения проверки; IBAN приходит PDF на e-mail, карта VISA «как можно быстрее»", kind: "provider" }, 
        { label: "Обычный счёт Girokonto", value: "бесплатно, если вам меньше 28 лет или на счёт приходит от 1 000 € в месяц", kind: "provider" },
        { label: "Стоимость Basiskonto", value: "на странице ING не указана", kind: "none" },
      ],
      conditions: ["Обычный счёт: вам от 18 лет, хорошая кредитная история, регулярный доход, вы живёте и работаете в Германии", "Basiskonto: место жительства в Германии или другой стране ЕС, нет другого платёжного счёта в Германии, счёт для себя как частного лица"],
      links: [act("ING: Girokonto, условия и цена", o.ingGiro), act("ING: вопросы о проверке личности и Basiskonto", o.ingFaq)],
    },
    {
      id: "n26", name: "N26", label: "Обычный счёт · приложение",
      summary: "Полностью мобильный счёт: открывается в приложении, личность проверяют по видео. Это обычный счёт, а не Basiskonto: Basiskonto на странице N26 не упомянут: условия счёта задаёт сам банк.",
      facts: [{ label: "Проверка личности и срок", value: "в приложении по видео или фото документа (способы названы в справке N26); по странице N26 счёт открывается «за несколько минут». Отдельный срок проверки на страницах N26 не указан", kind: "provider" }, { label: "Тариф N26 Standard", value: "0 € в месяц; физическая карта: разово 10 €", kind: "provider" }],
      conditions: ["Вам от 18 лет и вы живёте в стране, где работает N26", "Нужны смартфон и действующий документ: принимаются паспорта, национальные удостоверения и виды на жительство, а личный список документов показывает приложение в начале проверки", "Если ваш документ не поддерживается, N26 не сможет открыть счёт", "В некоторых случаях нужно подтверждение официального адреса"],
      links: [act("N26: как открыть счёт", o.n26Open), act("N26: какие документы принимают", o.n26Id)],
    },
    {
      id: "revolut", name: "Revolut", label: "Обычный счёт · приложение",
      summary: "Счёт открывается в приложении. Это обычный счёт, а не Basiskonto: Basiskonto на страницах Revolut не упомянут: условия счёта задаёт сам банк. Если вы живёте в Германии и у счёта немецкий IBAN (начинается с DE), вы клиент немецкого филиала Revolut Bank UAB.",
      facts: [
        { label: "Тариф Standard", value: "0 € в месяц; доставка физической карты: 7,99 € обычная, 19,99 € с трекингом, 29,99 € самая быстрая", kind: "provider" },
        { label: "Проверка личности", value: "обычно до 1 рабочего дня, иногда до 7", kind: "provider" },
      ],
      conditions: ["Вам от 18 лет и вы законно проживаете в стране, где работает Revolut", "Нужны действующий государственный документ и селфи; какие типы документов принимаются, показывает экран загрузки в приложении", "Фотографируйте оригинал документа: копии, сканы и снимки с экрана не принимаются", "Если гражданство и адрес проживания разные, могут попросить подтверждение адреса", "Один личный счёт Revolut на человека"],
      links: [act("Revolut: кто может открыть счёт", o.revolutStart), act("Revolut: как проходит проверка личности", o.revolutVerify), act("Revolut: тарифы для Германии", o.revolutFees)],
    },
    {
      id: "vivid", name: "Vivid", label: "Обычный счёт · приложение",
      summary: "Счёт открывается в приложении без отделения. Это обычный счёт, а не Basiskonto: Basiskonto на страницах Vivid не упомянут. Страницы Vivid называют принимаемые документы только из ЕС/ЕЭЗ и Швейцарии, поэтому паспорт другой страны здесь не подтверждён.",
      facts: [{ label: "Проверка личности и срок", value: "отдельный срок проверки на страницах Vivid не указан; по справке Vivid счёт готов, как только вы завершили регистрацию в приложении", kind: "none" }, { label: "Тариф Standard", value: "3,90 € в месяц; бесплатно, если картой была хотя бы одна оплата или остаток на всех счетах Vivid больше 1 000 €. Физическая карта 19,90 € плюс доставка 9,90 €. Данные из таблицы тарифов, действующей с 22 января 2024: актуальные значения показаны в заявке банка", kind: "provider" }],
      conditions: ["Вам от 18 лет", "Принимаются: действующее удостоверение личности ЕС/ЕЭЗ, паспорт ЕС/ЕЭЗ или Швейцарии, вид на жительство ЕС/ЕЭЗ, а также немецкая D-виза или Fiktionsbescheinigung (по странице Vivid; на ней сказано о пяти документах, а перечислены четыре)", "Какие страны проживания подходят, страница не указывает: это показывает регистрация в приложении"],
      links: [act("Vivid: какие документы принимают", o.vividDocs), act("Vivid: как открыть счёт", o.vividOpen), act("Vivid: таблица тарифов", o.vividFees)],
    },
  ],
  branch: [
    {
      id: "berliner-sparkasse", name: "Berliner Sparkasse", label: "Basiskonto · отделения в Берлине",
      summary: "Банк с отделениями в Берлине. На странице банка есть форма заявления, запись на приём и круглосуточная линия 030 869 869 69. Способ возврата формы на странице не описан.",
      facts: [{ label: "Проверка личности и срок", value: "три способа: eID с немецким Personalausweis (круглосуточно), видеозвонок IDnow (пн–пт 8:00–22:30, сб, вс и праздники 10:00–22:00; Personalausweis или Reisepass из списка стран банка) или визит в отделение в течение 7 дней с номером заявки (действующий Personalausweis или Reisepass, иностранные документы принимаются). Банк пишет: открыть счёт можно за 5 минут", kind: "provider" }, providerPrice("Giro Individual 2,95 €, Giro Digital 4,95 €, Giro Pauschal 8,95 € в месяц")],
      links: [act("Berliner Sparkasse: Basiskonto и запись на приём", o.sparkasseBasis), act("Форма заявления на Basiskonto", o.sparkasseForm), act("Entgeltinformation Giro Digital Basis", o.sparkassePrice)],
    },
    {
      id: "commerzbank", name: "Commerzbank", label: "Basiskonto · запись и проверка в отделении",
      summary: "Заполните форму, подпишите и запишитесь на приём по почте, по телефону 069 5 8000 8000 или в отделении. Документы из списка в форме принесите на приём. Личность проверяют в отделении, решение приходит письменно. Онлайн-подача на странице не описана.",
      facts: [{ label: "Проверка личности и срок", value: "личность проверяют в отделении на приёме, куда вы приносите документы из списка в форме; затем банк проверяет заявление и сообщает решение письменно. Срок решения на странице Commerzbank не указан", kind: "none" }, providerPrice("6,90 € в месяц")],
      links: [act("Commerzbank: Basiskonto, порядок подачи", o.commerzbankBasis), act("Форма заявления на Basiskonto", o.commerzbankForm)],
    },
    {
      id: "postbank", name: "Postbank", label: "Giro Basis · проверка на почте",
      summary: "Заявление вместе с купоном Postident: личность проверяют в отделении Postbank или Deutsche Post по действующему Personalausweis или Reisepass. Подписанное заявление затем отправляется письмом в Postbank, Bonn. Онлайн-открытие на странице не описано.",
      facts: [{ label: "Проверка личности и срок", value: "видеопроверка WebID (7:00–22:00) занимает 5–10 минут, онлайн-банкинг доступен сразу после неё; PostIdent: купон и документ несут в отделение Deutsche Post, срок на странице не указан. Принимаются Personalausweis и Reisepass, иностранные аналоги с фото и MRZ", kind: "provider" }, providerPrice("4,90 € в месяц (по состоянию на 01.11.2026)")],
      conditions: ["Для проверки на почте нужен действующий Personalausweis или Reisepass: другие документы в форме не названы"],
      links: [act("Форма заявления с Postident", o.postbankForm), act("Entgeltinformation Giro Basis", o.postbankPrice)],
    },
  ],
};
const bankProvidersNote = "Цены и порядок взяты с официальных страниц и документов самих банков 19 октября 2026 года и могут измениться; актуальные значения показаны в заявке банка. Это не рейтинг и не рекомендация. Если нужного банка здесь нет, действуйте по общим шагам выше: порядок банка указан на его официальной странице.";

function bankPlan(a: Answers): Plan {
  if (a.goal === "refused") return {
    fit: "fits",
    why: ["Банк уже отказал в открытии счёта: нужен порядок оспаривания"],
    title: "Банк отказал в Basiskonto: как оспорить отказ",
    summary: "Отказ в базовом счёте допустим только в нескольких случаях, названных в законе. Если причина не подходит, можно бесплатно обратиться в BaFin.",
    steps: [
      step("Соберите документы по отказу", "Нужны копия заявления на официальной форме «Antrag auf Abschluss eines Basiskontovertrags» и письменный отказ. Банк должен принять заполненное заявление и подтвердить дату получения на копии.", "Выбор", act("Официальная форма заявления", o.basiskontoForm), act("Verbraucherzentrale: право на Basiskonto для приехавших", o.basiskontoNewcomers)),
      step("Поймите причину отказа по закону", "Отказать можно, если у вас уже есть платёжный счёт в Германии (кроме закрытого или объявленного к закрытию), за последние три года вы осуждены за умышленное преступление против этого банка, раньше этот банк правомерно расторг ваш базовый счёт либо открытие противоречит законам о банках и борьбе с отмыванием денег.", "Онлайн", act("BaFin: Basiskonto, основания отказа", o.basiskonto)),
      step("Подайте заявление в BaFin", "Административное производство бесплатно: приложите копию заявления и отказ, если он есть. Если отказ необоснован, BaFin может обязать банк открыть счёт; договор вы всё равно подписываете сами. Расходы на почту, юриста и консультации вы несёте сами.", "Онлайн", act("Форма заявления в BaFin", o.basiskontoProcedureForm), act("BaFin: Basiskonto", o.basiskonto), act("Другие пути: суд или арбитражная служба", o.bafinArbitration)),
    ],
    note: "Это общая информация, а не юридическая консультация. Сроки и шансы зависят от причины отказа.",
  };
  if (a.id === "fiction") return {
    fit: "insufficient",
    why: ["Есть только Fiktionsbescheinigung: BaFin не считает её достаточной для проверки личности"],
    title: "Fiktionsbescheinigung для открытия счёта недостаточна",
    summary: "BaFin прямо указывает, что Fiktionsbescheinigung по § 81 Abs. 5 AufenthG для проверки личности банком не годится.",
    steps: [step("Выясните, чем подтвердить личность", "Обратитесь в ведомство, выдавшее справку, за документом, который банк примет. Подойдут действующий паспорт, удостоверение личности Германии, а также Aufenthaltsgestattung, Duldung или Ankunftsnachweis, если они вам положены. Для граждан Украины действует отдельный порядок: украинский документ вместе с немецкой справкой.", "Выбор", act("BaFin: какие документы принимают", o.basiskonto), act("Verbraucherzentrale: советы приехавшим", o.basiskontoNewcomers))],
    note: "Принимает ли документ банк, решает его проверка личности.",
  };
  if (a.id === "none" || a.id === "unknown") return {
    fit: "insufficient",
    why: [a.id === "none" ? "Подходящего документа нет или срок его действия истёк" : "Вы не знаете, подойдёт ли ваш документ"],
    title: "Сначала подготовьте документ, который банк обязан принять",
    summary: "Банк обязан установить личность по действующему документу. Если он отсутствует или просрочен, банк вправе отказать.",
    steps: [step("Подготовьте принимаемый документ", "Подходят действующий паспорт, удостоверение личности Германии, а также Aufenthaltsgestattung, Duldung или Ankunftsnachweis. Если срок действия паспорта истёк, продлите его в консульстве или у выдавшего органа вашей страны. Если подходящего документа нет, обратитесь в немецкое ведомство за документом, которым можно подтвердить личность.", "Выбор", act("BaFin: какие документы принимают", o.basiskonto), act("Закон: способы проверки личности (§ 12 GwG)", o.gwgIdent))],
    note: "Это общая информация. Какие документы приемлемы в вашем случае, решает проверка личности банком.",
  };
  const noAddress = a.address === "no";
  const idName: Record<string, string> = {
    de: "Паспорт или удостоверение личности Германии",
    eu: "Паспорт или удостоверение личности страны ЕС/ЕЭЗ",
    foreign: "Паспорт страны вне ЕС/ЕЭЗ",
    authority: "Aufenthaltsgestattung, Duldungsbescheinigung или Ankunftsnachweis",
    ukraine: "Украинский документ и немецкая справка ведомства",
  };
  const idText: Record<string, string> = {
    de: "Паспорт или удостоверение личности Германии подходит, если он действителен. Проверьте срок действия.",
    eu: "Паспорт или удостоверение личности страны ЕС/ЕЭЗ: BaFin называет принимаемыми действующие официальные документы с фото, которые отвечают немецким требованиям к паспортам и удостоверениям. Проверьте срок действия.",
    foreign: "Паспорт страны вне ЕС/ЕЭЗ: иностранный документ принимается, если он признан по закону о пребывании. Банк проверяет это сам и может запросить дополнительные документы. Если банк документ не принял, действует порядок из маршрута «Банк отказал мне в открытии счёта».",
    authority: "По данным BaFin, Aufenthaltsgestattung считается заменой паспорта, также принимаются Duldungsbescheinigung и Ankunftsnachweis. Документ должен быть действителен.",
    ukraine: "Если действующего паспорта или украинской ID-карты с защитными признаками нет, банк должен принять украинский документ вместе с немецкой справкой ведомства (Anlaufbescheinigung, Fiktionsbescheinigung или Meldebescheinigung). Ссылайтесь на разъяснение BaFin.",
  };
  const idKey = a.id ?? "de";
  const second = a.goal === "another";
  const documentDetail = `${idText[idKey]}${noAddress ? " Постоянного адреса нет: укажите почтовый адрес, например родственника, друга или консультационной службы. Регистрация по месту жительства для Basiskonto не нужна." : second ? "" : " Для Basiskonto платёжного счёта в Германии у вас быть не должно."}`;
  const chooseStep = step("Выберите банк", "Ниже готовые варианты с ценами и порядком из официальных документов самих банков. Обычный счёт открывают на условиях банка" + (second ? "." : ", а если банк отказал, действует право на Basiskonto (базовый счёт): см. шаг ниже."), "Выбор", act("BaFin: открытие Girokonto", o.girokonto));
  const docStep = step(noAddress ? "Подготовьте документ и почтовый адрес" : "Подготовьте документ", documentDetail, "Выбор", act("BaFin: Basiskonto, документы и адрес", o.basiskonto), act("Закон: способы проверки личности (§ 12 GwG)", o.gwgIdent));
  const remoteStep = step("Откройте счёт без визита в отделение", "Direct-банки работают только онлайн, через приложение или по телефону. Личность проверяют по Videoident или Postident вместо личного визита, как описывает BaFin. Ниже варианты банков: DKB требует распечатать и подписать форму Basiskonto, у ING и N26 личность проверяют онлайн. Если банк не принимает ваш документ при такой проверке, откройте счёт лично в отделении (второй способ).", "Онлайн", act("BaFin: открытие Girokonto", o.girokonto), act("BaFin: правила Videoident", o.videoident), act("Verbraucherzentrale: Basiskonto для приехавших", o.basiskontoNewcomers));
  const branchStep = step("Откройте счёт в отделении банка", "В банке с отделениями счёт открывают на месте, предъявив документ, как описывает BaFin. Порядок записи и часы приёма у каждого банка свои: они описаны в карточках банков ниже.", "Лично", act("BaFin: открытие Girokonto", o.girokonto), act("BaFin: Basiskonto", o.basiskonto));
  const fallbackStep = step("Если банк отказал или не принял документ: Basiskonto", "У вас есть право на Basiskonto: пополнение и снятие, переводы, прямые списания и оплата картой, без овердрафта. Банк с онлайн-банкингом обязан дать его и по Basiskonto. Используйте официальную форму «Antrag auf Abschluss eines Basiskontovertrags»: банки и сберкассы обязаны её предоставить, в том числе по почте и на сайте. Подайте полностью заполненную форму и сохраните подтверждение даты получения. У банка есть 10 рабочих дней, чтобы предложить счёт. Если ответа нет или он отрицательный, откройте маршрут ещё раз и выберите «Банк отказал мне в открытии счёта».", "Онлайн", act("Скачать форму заявления", o.basiskontoForm), act("BaFin: сроки и отказ", o.basiskonto), act("Verbraucherzentrale: как подать заявление", o.basiskontoNewcomers));
  const costStep = step("Проверьте стоимость счёта", "Банк вправе брать только соразмерные комиссии. По данным Verbraucherzentrale (общественной организации по защите прав потребителей), базовые счета в Германии бывают дорогими: в 2023 году до €27,83 в месяц. Цены обычных счетов смотрите в карточках банков ниже.", "Выбор", act("Verbraucherzentrale: стоимость и право на счёт", o.basiskontoNewcomers));
  const tail = second ? [] : [fallbackStep, costStep];
  const docs = [idName[idKey], ...(noAddress ? ["Почтовый адрес (родственника, друга или консультационной службы)"] : [])];
  const facts = [
    { label: "Если банк отказал в обычном счёте: срок решения по заявлению на Basiskonto", value: "банк обязан ответить в течение 10 рабочих дней (это предельный срок для Basiskonto, а не обычное время открытия счёта)", kind: "official" as const },
    { label: "Если придётся брать Basiskonto: стоимость", value: "бывает высокой: до €27,83 в месяц в 2023 году по данным Verbraucherzentrale", kind: "authority" as const },
  ];
  const needsCheck = idKey === "authority" || idKey === "ukraine";
  const methods: Method[] = [
    { id: "remote", kind: "online", title: "Без визита: онлайн, приложение или телефон", summary: "Direct-банк проверяет личность по Videoident или Postident. Подходит, если вы не хотите или не можете идти в отделение.", availability: needsCheck ? "conditional" : "available", availabilityLabel: needsCheck ? "С оговоркой: проверка по видео или Postident для вашего документа может не пройти; тогда подходит способ «лично»" : "Доступно для вашего документа", conditions: ["Банк проверяет личность по Videoident или Postident вместо личного визита", "Банк с онлайн-банкингом обязан дать онлайн-банкинг и по Basiskonto"], documents: docs, facts: second ? [] : facts, providers: bankProviders.remote, providersTitle: "Выберите банк без визита в отделение", providersNote: bankProvidersNote, steps: [chooseStep, docStep, remoteStep, ...tail] },
    { id: "branch", kind: "in-person", title: "Лично в отделении банка", summary: "Счёт открывают на месте, вы показываете документ сотруднику и можете задать вопросы.", availability: "available", availabilityLabel: "Доступно в банках с отделениями", conditions: ["Запись и часы приёма у каждого банка свои: они описаны в карточках банков ниже"], documents: docs, facts: second ? [] : facts, providers: bankProviders.branch, providersTitle: "Выберите банк с отделением", providersNote: bankProvidersNote, steps: [chooseStep, docStep, branchStep, ...tail] },
  ];
  return {
    fit: needsCheck || noAddress ? "conditional" : "fits",
    why: [`Документ: ${idName[idKey]}`, second ? "У вас уже есть счёт в Германии: нужен ещё один" : "Немецкого счёта у вас сейчас нет", noAddress ? "Постоянного адреса нет: понадобится почтовый адрес" : "Постоянный адрес есть"],
    title: second ? "Ещё один счёт: обычный счёт на условиях банка" : noAddress ? "Счёт без постоянного адреса: понадобится почтовый адрес" : "Первый счёт в Германии: Girokonto или Basiskonto",
    summary: second ? "Право на Basiskonto (базовый счёт) действует, только если платёжного счёта в Германии нет, поэтому ещё один счёт вы открываете на обычных условиях банка. Выберите способ ниже." : "Условия обычного счёта Girokonto задаёт банк. Basiskonto: право на базовый счёт у потребителя, у которого ещё нет платёжного счёта в Германии: банк может отказать только в немногих случаях, прописанных в законе. Выберите способ ниже.",
    methods,
    steps: methods[0].steps,
    note: "Помочь с формой и перепиской может человек, которому вы доверяете, или консультационная служба. Прийти с сопровождающим или действовать через представителя можно, если банк это разрешает: BaFin такой порядок не описывает. Страница BaFin не называет регистрацию по месту жительства условием права на Basiskonto. Это общая информация, а не юридическая консультация.",
  };
}

function telecomPlan(a: Answers): Plan {
  const keep = act("Bundesnetzagentur: права потребителя", o.telecomContracts);
  if (a.need === "new" && a.product === "unlimited") return telecomUnlimitedPlan();
  if (a.need === "new" && a.product === "home") return telecomHomePlan();
  if (a.need === "switch") return {
    title: "Смена провайдера и переезд: новый провайдер организует переключение",
    summary: "Заключайте новый договор заранее: новый провайдер сам займётся сменой и переносом номера, а старый обязан сохранять услугу до переключения.",
    steps: [
      step("Оформите новый договор заранее", "Так вы не потеряете номер и линию. Новый провайдер обычно помогает расторгнуть старый договор. Проверьте в счёте или личном кабинете срок договора и сроки уведомления: поздняя отмена обычно продлевает договор.", "Выбор", keep, act("Verbraucherzentrale: смена провайдера", o.telecomSwitching)),
      step("Следите за перерывом связи", "Старый провайдер должен держать услугу до переключения и взять не более 50% платы за подключение. Перерыв не должен быть дольше одного рабочего дня. За каждый лишний рабочий день положено 20% месячной платы (не менее €10), при неудавшемся переносе номера – €10 в день со второго рабочего дня.", "Ожидание", act("Verbraucherzentrale: права при смене", o.telecomConsumerRights), act("Verbraucherzentrale: смена провайдера", o.telecomSwitching)),
      step("Если вы переезжаете", "Если ваш провайдер не обслуживает новый адрес, договор можно расторгнуть с уведомлением за один месяц.", "Выбор", act("Verbraucherzentrale: переезд", o.telecomConsumerRights)),
    ],
  };
  if (a.need === "cancel") return {
    title: "Проверьте срок договора и расторгайте так, чтобы можно было доказать получение",
    summary: "Расторжение действует, только когда уведомление вовремя дошло до провайдера. После минимального срока продлённый договор можно расторгнуть в любой момент с уведомлением за один месяц.",
    steps: [
      step("Найдите срок и срок уведомления", "Они указаны в договоре, счёте или личном кабинете: счёт обязан показывать начало договора, конец минимального срока и крайний срок уведомления. Провайдер должен предупредить вас перед автоматическим продлением.", "Выбор", keep, act("Verbraucherzentrale: как определить срок", o.telecomConsumerRights)),
      step("Отправьте расторжение с доказательством получения", "Подойдёт заказное письмо или факс. Если вы заключали договор онлайн, провайдер обязан предоставить кнопку расторжения.", "Лично", keep),
      step("Если условия изменили в одностороннем порядке", "Договор можно расторгнуть без срока уведомления и без неустойки в течение трёх месяцев после получения сообщения об изменении. Исключения: устройство, которое вы оставляете себе, и изменения только в вашу пользу или обязательные по закону.", "Выбор", act("Bundesnetzagentur: одностороннее изменение", o.telecomContracts), act("Verbraucherzentrale: изменения цены", o.telecomConsumerRights)),
    ],
  };
  if (a.need === "problem") {
    const issue = a.issue ?? "speed";
    return {
      title: issue === "speed" ? "Скорость ниже обещанной: что можно требовать" : issue === "outage" ? "Нет связи или не пришёл мастер: компенсация" : "Провайдер изменил условия или цену",
      summary: "Сначала обратитесь к провайдеру и сохраните переписку. Дальше есть жалоба в Bundesnetzagentur и посредничество Schlichtungsstelle; по вопросам гражданского права поможет Verbraucherzentrale.",
      steps: [
        issue === "speed"
          ? step("Зафиксируйте скорость", "Вы вправе рассчитывать как минимум на 15 Мбит/с на приём, 5 Мбит/с на отдачу и задержку до 150 мс (через Bundesnetzagentur). Если скорость значительно и регулярно ниже договорной, можно уменьшить оплату или расторгнуть договор, но нужны доказательства: например, измерения по инструменту Bundesnetzagentur. Это относится и к мобильному интернету.", "Онлайн", act("Verbraucherzentrale: минимальная скорость", o.telecomConsumerRights), act("Bundesnetzagentur: новые права", o.telecomRights))
          : issue === "outage"
            ? step("Проверьте размер компенсации", "При полном отсутствии связи после второго дня: 10% месячной платы (не менее €5) за 3–4-й день и 20% (не менее €10) с 5-го дня. За пропущенный визит мастера положено 20% месячной платы (не менее €10).", "Выбор", act("Verbraucherzentrale: компенсации", o.telecomConsumerRights), keep)
            : step("Проверьте срок и право на расторжение", "Провайдер должен сообщить об изменении за 1–2 месяца. Вы можете расторгнуть договор в течение трёх месяцев после этого сообщения, без неустойки (исключение: устройство, которое вы оставляете себе).", "Выбор", act("Verbraucherzentrale: изменение условий", o.telecomConsumerRights), keep),
        step("Напишите провайдеру и сохраните ответ", "Опишите проблему письменно, укажите срок для ответа и сохраните доказательства: счета, измерения, переписку.", "Онлайн", keep),
        step("Если провайдер не решил проблему", "Подайте жалобу через контактную форму Bundesnetzagentur или попросите посредничество Schlichtungsstelle: оно предлагает компромисс, но не взыскивает долги. По вопросам действительности расторжения и отзыва договора обратитесь в Verbraucherzentrale или к юристу.", "Онлайн", act("Bundesnetzagentur: Schlichtung", o.telecomArbitration), keep),
      ],
    };
  }
  const summaryStep = step("Потребуйте краткое изложение договора", "Оно должно содержать контакты провайдера, основные характеристики услуги, плату за подключение, срок, условия продления и расторжения. Для телефонного договора он вступает в силу только после того, как вы получили изложение и подтвердили договор в текстовой форме, например по e-mail.", "Онлайн", keep, act("Verbraucherzentrale: ваши права", o.telecomConsumerRights));
  const termStep = step("Выберите срок", "Первичный срок не больше 24 месяцев, а провайдер должен предложить и договор на срок не более 12 месяцев. После минимального срока продлённый договор расторгается в любой момент с уведомлением за один месяц. Добавление услуг или устройств не продлевает срок без вашего согласия.", "Выбор", keep);
  const idStep = step("Подготовьте документ для идентификации", "Для SIM-карты предоплаты закон требует проверить имя и дату рождения по действующему документу с фото. Подходят в том числе Reisepass и Aufenthaltstitel (вид на жительство), а также Ankunftsnachweis, Aufenthaltsgestattung и Duldung; закон допускает видео- и онлайн-проверку, если оператор их предлагает. Порядок и принимаемые документы каждого оператора указаны в его карточке ниже.", "Выбор", act("Закон: § 172 TKG", o.telecomIdLaw), act("Bundesnetzagentur: идентификация при предоплате", o.telecomIdBna));
  const saveStep = step("Сохраните документы и сроки", "Запишите дату начала, конец минимального срока и крайний срок уведомления. Счета обязаны их показывать.", "Выбор", keep);
  const withdrawalStep = step("Запомните право на отзыв", "Для договоров по телефону, онлайн и вне торговых помещений обычно действует 14-дневное право отзыва. Если вы заключили договор онлайн, провайдер обязан предоставить кнопку расторжения.", "Выбор", keep);
  const shopStep = step("Учтите, что в магазине права на отзыв обычно нет", "Право на отзыв в 14 дней относится к договорам по телефону, онлайн и вне торговых помещений. Для покупок в магазине оно обычно не действует, поэтому читайте условия до подписи.", "Выбор", keep);
  const sharedFacts = [
    { label: "Максимальный первичный срок договора", value: "24 месяца; провайдер должен предложить и вариант до 12 месяцев", kind: "official" as const },
    { label: "Расторжение после минимального срока", value: "в любой момент с уведомлением за один месяц", kind: "official" as const },
  ];
  const methods: Method[] = [
    { id: "remote", kind: "online", title: "Онлайн или по телефону", summary: "Договор заключается без визита в магазин. Действует право отзыва. Если телефон поддерживает eSIM (SIM-карту внутри телефона), SIM по почте не нужна: оператор присылает профиль, который устанавливается на телефон. Какие операторы выдают eSIM, указано в их карточках.", availability: "available", availabilityLabel: "Доступно при заключении договора у большинства провайдеров", conditions: ["Провайдер обязан дать краткое изложение договора до заключения", "Телефонный договор вступает в силу после подтверждения в текстовой форме"], documents: telecomIdDocs, facts: [{ label: "Право отзыва", value: "обычно 14 дней", kind: "official" }, ...sharedFacts], providers: telecomRemoteProviders, providersTitle: "Выберите оператора без визита в магазин", providersNote: telecomProvidersNote, steps: [idStep, summaryStep, termStep, withdrawalStep, saveStep] },
    { id: "shop", kind: "in-person", title: "В магазине", summary: "Договор подписывается на месте. Права отзыва в 14 дней обычно нет.", availability: "available", availabilityLabel: "Доступно", conditions: ["Читайте условия до подписи: после покупки в магазине отзыв обычно невозможен"], documents: telecomIdDocs, facts: sharedFacts, providers: telecomShopProviders, providersTitle: "Выберите вариант с личным визитом", providersNote: telecomProvidersNote, steps: [idStep, summaryStep, termStep, shopStep, saveStep] },
  ];
  return {
    fit: "fits",
    why: ["Вам нужен новый договор на мобильную связь или интернет"],
    title: "Новый договор: что проверить до подписи",
    summary: "Провайдер обязан дать краткое изложение договора в текстовом виде до заключения. Максимальный первичный срок: 24 месяца. Выберите, где вы будете заключать договор.",
    methods,
    steps: methods[0].steps,
    note: "Это общая информация, а не юридическая консультация. Условия конкретного тарифа смотрите в договоре.",
  };
}

const telecomPriceDate = "Цены с официальных страниц на 20 октября 2026 года; они меняются, актуальная цена показывается при заказе.";
function telecomCommonSteps() {
  const keep = act("Bundesnetzagentur: права потребителя", o.telecomContracts);
  return {
    summary: step("Потребуйте краткое изложение договора", "Оно должно содержать контакты провайдера, основные характеристики услуги, плату за подключение, срок, условия продления и расторжения.", "Онлайн", keep, act("Verbraucherzentrale: ваши права", o.telecomConsumerRights)),
    term: step("Выберите срок", "Первичный срок не больше 24 месяцев, а провайдер должен предложить и договор на срок не более 12 месяцев. После минимального срока продлённый договор расторгается в любой момент с уведомлением за один месяц.", "Выбор", keep),
    withdrawal: step("Запомните право на отзыв", "Для договоров по телефону, онлайн и вне торговых помещений обычно действует 14-дневное право отзыва. Для договора, заключённого онлайн, провайдер обязан предоставить кнопку расторжения.", "Выбор", keep),
    save: step("Сохраните документы и сроки", "Запишите дату начала, конец минимального срока и крайний срок уведомления. Счета обязаны их показывать.", "Выбор", keep),
  };
}
function telecomUnlimitedPlan(): Plan {
  const c = telecomCommonSteps();
  const funkIdStep = step("Пройдите идентификацию в приложении", "В приложении FUNK вы вводите данные, подтверждаете личность, привязываете способ оплаты, выбираете тариф и устанавливаете eSIM. На странице оператора сказано лишь «подтвердить личность»; какие документы подходят, она не уточняет, поэтому ориентируйтесь на перечень закона из карточки.", "Онлайн", act("freenet FUNK: заказ в приложении", o.funkApp), act("Закон: § 172 TKG", o.telecomIdLaw));
  const methods: Method[] = [
    { id: "app", kind: "online", title: "Заказ в приложении (eSIM)", summary: "Тариф оформляется в приложении без визита и без SIM-карты по почте. Нужен телефон, который поддерживает eSIM.", availability: "conditional", availabilityLabel: "Нужен телефон с eSIM", conditions: ["eSIM это та же SIM-карта, но встроенная в телефон: если телефон её поддерживает, вместо конверта по почте вы получаете её в приложении", "freenet FUNK на своей странице описывает заказ только через приложение (iOS и Google Play) и eSIM; заказ SIM-карты по почте там не упомянут"], documents: telecomIdDocs, facts: [{ label: "Цена безлимитного тарифа", value: "0,99 € в день или 19,99 € в месяц", kind: "provider" }, { label: "Срок", value: "безлимитный тариф можно отменить ежедневно", kind: "provider" }], providers: [
      { id: "funk", name: "freenet FUNK", label: "Приложение · eSIM · безлимит",
        summary: "Полностью цифровой тариф: заказ, идентификация и установка eSIM проходят в приложении.",
        facts: [{ label: "Безлимит", value: "«Echtes Unlimited» (безлимитный объём данных), 5G", kind: "provider" }, { label: "Цена", value: "0,99 € в день или 19,99 € в месяц", kind: "provider" }, { label: "SIM-карта по почте", value: "на странице не упомянута; только eSIM", kind: "provider" }],
        links: [act("freenet FUNK: тариф и заказ", o.funkApp)] },
    ], providersTitle: "Оператор без визита и без SIM по почте", providersNote: telecomPriceDate, steps: [funkIdStep, c.summary, c.term, c.withdrawal, c.save] },
    { id: "contract", kind: "online", title: "Договор у сетевого оператора", summary: "Безлимитный тариф с договором: SIM или eSIM, заказ онлайн.", availability: "available", availabilityLabel: "Доступно", conditions: ["Срок и условия смотрите в кратком изложении договора до заключения"], documents: telecomIdDocs, facts: [{ label: "Vodafone: Mobil XL Unlimited", value: "59,95 € в месяц, плата за подключение 0 €", kind: "provider" }, { label: "Сеть", value: "5G или 4G/LTE, безлимитный объём данных", kind: "provider" }], providers: [
      { id: "vodafone-unlimited", name: "Vodafone Unlimited", label: "Договор · онлайн · безлимит",
        summary: "Тариф Mobil XL Unlimited: безлимитный объём данных, Allnet-флэт (звонки в сети Германии без доплаты) и 5G.",
        facts: [{ label: "Цена", value: "59,95 € в месяц; плата за подключение 0 €", kind: "provider" }, { label: "Доставка SIM", value: "обычно 2–4 рабочих дня; eSIM загружается после подключения к Wi-Fi", kind: "provider" }],
        conditions: ["Идентификацию показывает форма заказа"],
        links: [act("Vodafone: безлимитные тарифы", o.vodafoneUnlimited), act("Vodafone: заказ и доставка", o.vodafoneOrder)] },
      { id: "telekom-contract", name: "Telekom: Handyvertrag", label: "Договор · SIM или eSIM",
        summary: "Договоры на мобильную связь с минимальным сроком и без срока; доставка SIM-карты или eSIM.",
        facts: [{ label: "Что приходит", value: "SIM-карта или eSIM для своего телефона либо SIM/eSIM вместе со смартфоном", kind: "provider" }, { label: "Срок", value: "есть договоры с минимальным сроком и договоры с ежемесячным расторжением", kind: "provider" }],
        links: [act("Telekom: договоры на мобильную связь", o.telekomPhone)] },
      { id: "o2-unlimited", name: "o2 Mobile Unlimited", label: "Договор · онлайн · безлимит",
        summary: "Безлимитный объём данных со скоростью не выше заявленной: у тарифа M это 100 Мбит/с в сети 5G.",
        facts: [{ label: "Unlimited M (до 100 Мбит/с)", value: "29,99 € в месяц, подключение 0 €, срок 24 месяца", kind: "provider" }, { label: "Другие уровни скорости", value: "S Special до 15 Мбит/с за 24,99 €, L до 300 Мбит/с за 39,99 € в месяц", kind: "provider" }, { label: "Пробный срок", value: "30 дней «Zufriedenheitsgarantie» (гарантия возврата)", kind: "provider" }, { label: "Без срока", value: "есть вариант Flex без минимального срока", kind: "provider" }],
        links: [act("o2: Mobile Unlimited M", o.o2Unlimited)] },
      { id: "oneandone-unlimited", name: "1&1 Unlimited", label: "Договор · онлайн · безлимит",
        summary: "Безлимитный объём данных с несколькими уровнями скорости.",
        facts: [{ label: "Unlimited XS", value: "19,99 € в месяц «dauerhaft» (постоянно), LTE до 15 Мбит/с", kind: "provider" }, { label: "Быстрый уровень", value: "5G до 300 Мбит/с; цена на странице зависит от тарифа", kind: "provider" }, { label: "Роуминг в ЕС", value: "до 30,6 ГБ в месяц без доплаты, сверх этого 1,31 € за ГБ", kind: "provider" }],
        links: [act("1&1: безлимитные тарифы", o.oneUnlimited)] },
    ], providersTitle: "Операторы с безлимитным тарифом", providersNote: telecomPriceDate, steps: [step("Подготовьте документ для идентификации", "Нужен действующий документ с фото из перечня закона (§ 172 TKG), в том числе Reisepass или Aufenthaltstitel (вид на жительство).", "Выбор", act("Закон: § 172 TKG", o.telecomIdLaw)), c.summary, c.term, c.withdrawal, c.save] },
  ];
  return {
    fit: "fits",
    why: ["Вам нужен безлимитный мобильный интернет для смартфона"],
    title: "Безлимитный мобильный интернет: варианты по удобству",
    summary: "Самый простой способ: приложение с eSIM без визита и без SIM-карты по почте. Если нужен договор у сетевого оператора, оформите его онлайн.",
    methods,
    steps: methods[0].steps,
    note: "Это общая информация, а не юридическая консультация. Тарифы здесь не сравниваются и не оцениваются.",
  };
}
function telecomHomePlan(): Plan {
  const c = telecomCommonSteps();
  const methods: Method[] = [
    { id: "home-5g", kind: "online", title: "Интернет по мобильной сети, без мастера", summary: "Роутер подключается к розетке, ничего монтировать не нужно. Подходит, если нет проводного интернета или он нужен быстро.", availability: "available", availabilityLabel: "Доступно, если в доме есть покрытие 5G/LTE", conditions: ["Нужно покрытие 5G/LTE по вашему адресу: оператор проверяет его при заказе"], documents: ["Действующий документ с фото и адрес проживания"], facts: [{ label: "Монтаж", value: "не нужен, мастер не приходит", kind: "provider" }], providers: [
      { id: "o2-homespot", name: "o2 HomeSpot", label: "5G/LTE · без мастера",
        summary: "Wi-Fi-роутер из розетки: интернет сразу, без установки.",
        facts: [{ label: "50 Мбит/с", value: "24,99 € в месяц, с 13-го месяца 34,99 €", kind: "provider" }, { label: "100 Мбит/с", value: "29,99 € в месяц, с 13-го месяца 39,99 €", kind: "provider" }, { label: "Подключение и срок", value: "9,99 € один раз; срок 24 месяца", kind: "provider" }],
        links: [act("o2: тарифы HomeSpot", o.o2HomeSpot)] },
      { id: "vodafone-gigacube", name: "Vodafone GigaCube", label: "5G/LTE · без мастера",
        summary: "Роутер, который достаточно включить в розетку.",
        facts: [{ label: "GigaCube Unlimited", value: "74,99 € в месяц", kind: "provider" }],
        links: [act("Vodafone: GigaCube и безлимит", o.vodafoneUnlimited)] },
    ], providersTitle: "Операторы без мастера", providersNote: telecomPriceDate, steps: [step("Проверьте покрытие по адресу", "Введите адрес на странице оператора: она покажет, какие скорости доступны.", "Онлайн", act("o2: тарифы HomeSpot", o.o2HomeSpot)), c.summary, c.term, c.withdrawal, c.save] },
    { id: "home-fixed", kind: "online", title: "Проводной интернет: DSL, кабель, оптоволокно", summary: "Нужен доступный по вашему адресу тип подключения; иногда приходит мастер. Обычно выгоднее по скорости, но подключение занимает больше времени.", availability: "conditional", availabilityLabel: "Зависит от адреса", conditions: ["Тип подключения и скорость определяются проверкой адреса на странице оператора", "Минимальный срок у Vodafone: 24 месяца"], documents: ["Действующий документ с фото и адрес проживания", "Согласие владельца жилья на подключение, если оно нужно"], facts: [{ label: "Скорости Vodafone", value: "от 50 до 1000 Мбит/с; роутер по акции 0 € в месяц первые 24 месяца, затем от 4,99 € в месяц", kind: "provider" }], providers: [
      { id: "vodafone-home", name: "Vodafone: интернет дома", label: "DSL, кабель, оптоволокно",
        summary: "Оператор проверяет доступность по адресу и предлагает подходящий тип подключения.",
        facts: [{ label: "Срок", value: "минимум 24 месяца", kind: "provider" }, { label: "Цена", value: "на странице: от 9,99 € в месяц за 50 Мбит/с, от 19,99 € в месяц за 100–1000 Мбит/с", kind: "provider" }],
        links: [act("Vodafone: интернет дома", o.vodafoneHome)] },
      { id: "o2-dsl", name: "o2 DSL", label: "DSL · проверка адреса",
        summary: "Тарифы DSL с проверкой доступности по адресу.",
        facts: [], links: [act("o2: тарифы DSL", o.o2Dsl)] },
    ], providersTitle: "Операторы проводного интернета", providersNote: telecomPriceDate, steps: [step("Проверьте доступность по адресу", "Введите адрес на странице оператора и посмотрите, какой тип подключения и какие скорости доступны.", "Онлайн", act("Vodafone: интернет дома", o.vodafoneHome)), c.summary, c.term, c.withdrawal, c.save] },
  ];
  return {
    fit: "fits",
    why: ["Вам нужен интернет дома"],
    title: "Интернет дома: варианты по удобству",
    summary: "Проще и быстрее всего: роутер на мобильной сети: розетка, и интернет работает. Проводной интернет чаще быстрее, но зависит от адреса и может требовать мастера.",
    methods,
    steps: methods[0].steps,
    note: "Это общая информация, а не юридическая консультация. Тарифы здесь не сравниваются и не оцениваются.",
  };
}

function dogPlan(a: Answers): Plan {
  if (a.stage === "ended") return {
    fit: "fits",
    why: ["Собаки больше нет у вас: умерла, потеряна или передана"],
    title: "Собаки больше нет: снимите её с учёта в реестре",
    summary: "Снятие с учёта в Hunderegister бесплатно и одновременно считается снятием с налогового учёта.",
    steps: [step("Сообщите в Hunderegister", "Снять собаку с учёта нужно после смерти, потери или передачи. Сообщение можно подать в кабинете владельца, письменно или по телефону.", "Онлайн", act("Hunderegister: услуга на ServicePortal", o.dogRegister), act("Налог на собаку: правила регистрации", o.dogTax))],
    note: "Невнесение в реестр и несообщение об изменениях: административное нарушение, штраф может достигать €10 000.",
  };
  if (a.stage === "move") return {
    fit: "fits",
    why: ["Собака уже в берлинском реестре, у вас новый адрес"],
    title: "Новый адрес: сообщите об изменении в Hunderegister",
    summary: "Уведомление об изменении бесплатно. Если собака внесена в реестр, отдельного визита в налоговую не нужно.",
    steps: [step("Подайте уведомление об изменении", "Откройте кабинет владельца на портале реестра или сообщите изменение письменно по e-mail либо по телефону (GovConnect GmbH).", "Онлайн", act("Hunderegister: услуга на ServicePortal", o.dogRegister))],
    note: "Не забудьте обновить и страховой полис: укажите страховщику новый адрес.",
  };
  if (a.breed === "unsure") return {
    fit: "insufficient",
    why: ["Вы не знаете, относится ли порода собаки к Listenhunde"],
    title: "Сначала определите, относится ли собака к Listenhunde",
    summary: "Listenhunde в Берлине: Pit Bull Terrier, American Staffordshire Terrier, Bull Terrier и их помеси. Любую другую собаку Ordnungsamt может признать опасной после инцидента.",
    steps: [
      step("Проверьте породу по документам", "Посмотрите родословную, паспорт животного и документы о приобретении. Для собаки младше года продавец обязан выдать письменную справку о приобретении (Erwerbsbescheinigung); для старших собак она тоже нужна, с указанием породы или помеси.", "Выбор", act("Берлин: Hundegesetz, вопросы и ответы", o.dogFaq)),
      step("Закажите оценку породы в Ordnungsamt", "Если порода неясна, оценку породы проводит Ordnungsamt района, где собака будет жить (Veterinär- und Lebensmittelaufsicht): по данным Bezirksamt Mitte, это дополнительные €30 к сбору за регистрацию. Там же сообщают о Listenhunde.", "Выбор", act("Ordnungsamt: список отделений", o.ordnungsaemter), act("Берлин: сообщить об опасной собаке", o.dogListed)),
      step("Вернитесь к маршруту", "После ответа выберите на предыдущем шаге «Нет» или «Да» и получите точный порядок действий.", "Выбор", act("Hunderegister: регистрация", o.dogRegister)),
    ],
  };
  const listed = a.breed === "yes";
  const steps: Step[] = [];
  if (listed) steps.push(
    step("Сразу после приобретения сообщите в Ordnungsamt", "Подайте заявление об опасной собаке (Listenhund) в Ordnungsamt района, где собака будет жить. Форма выдаётся в отделении. Нужны удостоверение личности, собаку нужно показать. Сбор €30. Если собака привезена в Германию нелегально или опасна для окружающих, регистрация невозможна. Управлять такой собакой можно с 18 лет.", "Лично", act("Берлин: сообщить об опасной собаке", o.dogListed), act("Ordnungsamt: адреса отделений", o.ordnungsaemter)),
    step("В течение 3 недель закажите Führungszeugnis", "Справку о несудимости для ведомств можно заказать в Bürgeramt. Её можно донести позже, но срок 3 недели идёт со дня сообщения.", "Лично", act("Берлин: сообщить об опасной собаке", o.dogListed), act("Берлин: Hundegesetz, вопросы и ответы", o.dogFaq)),
    step("В течение 8 недель получите Sachkundebescheinigung", "Срок: 8 недель после сообщения (Anzeige) в Ordnungsamt. Это «права» владельца такой собаки. Сдают теоретический тест (30 вопросов с выбором ответа, 45 минут под наблюдением, нужно 70% верных) и практический тест послушания с самой собакой: ей должен быть минимум 1 год. Экзамен принимают эксперты, утверждённые Сенатом Берлина. Список экспертов есть в Ordnungsamt и по ссылке ниже. Справку Sachkundebescheinigung выдаёт Ordnungsamt по заявлению на специальной форме.", "Лично", act("Признанные эксперты Берлина", o.dogExperts), act("Район Шпандау: Sachkunde и форма заявления", o.dogDistrict)),
    step("В течение 8 недель пройдите Wesenstest", "Wesenstest (тест характера) проводят признанные эксперты: список «Sachverständige – Wesenstest» опубликован на странице района. Как записаться, на странице не сказано: контакты экспертов указаны в списке. Если собаке меньше 15 месяцев, результат нужно представить в течение 4 недель после достижения этого возраста. Намордник на время теста не обязателен.", "Выбор", act("Признанные эксперты Берлина", o.dogExperts), act("Район Шпандау: список экспертов Wesenstest", o.dogDistrict)),
    step("В течение 8 недель оформите страховку ответственности", "Нужна Haftpflichtversicherung для собаки с франшизой не выше €500 в год. Подтверждение страховки представьте вместе со Sachkunde и результатом Wesenstest.", "Выбор", act("Берлин: Hundegesetz, вопросы и ответы", o.dogFaq), act("Район Шпандау: Hundegesetz", o.dogDistrict)),
    step("Получите зелёную бирку (Plakette)", "После регистрации у владельца появляется пронумерованная зелёная бирка: по данным Bezirksamt Mitte, её получают как подтверждение регистрации. Бирку крепят на ошейник или шлейку, когда собака вне огороженной территории и вне квартиры в многоквартирном доме. Пока бирки нет, носите с собой справку Ordnungsamt о приёме сообщения (Bescheinigung nach § 18 Abs. 1 Satz 4 HundeG) и показывайте её по требованию. Кто именно её выдаёт, на странице района Шпандау не сказано: бирку выдаёт ведомство, оформляющее вашу регистрацию.", "Выбор", act("Район Mitte: опасные собаки", "https://www.berlin.de/ba-mitte/politik-und-verwaltung/aemter/ordnungsamt/veterinaer-und-lebensmittelaufsicht/artikel.447735.php"), act("Район Шпандау: Hundegesetz", o.dogDistrict)),
  );
  steps.push(
    step(listed ? "Внесите собаку в Hunderegister" : "Подготовьте чип и документы о приобретении", listed ? "У каждой собаки в Берлине должен быть чип. Укажите 15-значный номер чипа из паспорта животного и данные о породе. Онлайн в кабинете владельца: €17,50, письменно или по телефону: €26,50. Регистрация в реестре одновременно служит налоговой." : "У каждой собаки в Берлине должен быть чип (15-значный номер указан в паспорте животного). Щенка до года можно приобретать только у уполномоченных продавцов; сохраните справку о приобретении, пока собака у вас.", "Выбор", act("Hunderegister: услуга на ServicePortal", o.dogRegister), act("Берлин: Hundegesetz, вопросы и ответы", o.dogFaq)),
  );
  if (!listed) steps.push(step("Внесите собаку в Hunderegister сразу", "Регистрация нужна, как только вы начинаете постоянно содержать собаку в Берлине. Онлайн в кабинете владельца: €17,50 за собаку. Письменно по почте или e-mail либо по телефону (GovConnect GmbH): €26,50. Квитанция о стоимости (Kostenbescheid) служит подтверждением. Отсутствие регистрации или несообщение об изменениях: административное нарушение со штрафом до €10 000.", "Онлайн", act("Hunderegister: услуга на ServicePortal", o.dogRegister)));
  steps.push(
    step("Налог на собаку", "Регистрации в Hunderegister достаточно: с 1 января 2024 года она считается налоговой, отдельного визита в Finanzamt не нужно. Налоговый срок: один месяц после покупки собаки или переезда. Налоговое уведомление приходит само, примерно через 4 недели. Можно подключить SEPA-списание или платить переводом. Жетоны больше не нужны. Размер ставки на странице услуги не указан: его назовёт уведомление. Освобождение подаётся отдельной услугой.", "Ожидание", act("Берлин: налог на собаку", o.dogTax), act("Hunderegister: регистрация", o.dogRegister)),
  );
  if (listed) steps.push(step("Правила на улице для Listenhunde", "На улице вне огороженной территории: намордник, защищающий от укуса (с 7 месяцев), и прочный поводок не длиннее 2 м. В многоквартирном доме правило действует и за пределами квартиры. На ошейнике или шлейке нужна зелёная бирка (Plakette); пока её нет, носите подтверждение регистрации. Индивидуальное освобождение от поводка выдаёт только Ordnungsamt, если опасность не ожидается.", "Выбор", act("Район Шпандау: Hundegesetz", o.dogDistrict), act("Берлин: Hundegesetz, вопросы и ответы", o.dogFaq)));
  else {
    steps.push(step("Страховка ответственности", "Страховка ответственности владельца собаки (Tierhalterhaftpflichtversicherung) в Берлине обязательна по закону, в том числе для собак, которых только выгуливают в Берлине. Для Listenhunde франшиза: не выше €500 в год.", "Выбор", act("Service Berlin: освобождение от поводка и страховка", o.dogLeash), act("Берлин: Hundegesetz, вопросы и ответы", o.dogFaq)));
    steps.push(step("Правила прогулок", "В городе действует общее правило о поводке, кроме отведённых площадок и зон без поводка. Поводок обязателен и при наличии Sachkundebescheinigung в парках, на общественном транспорте, в лестничных клетках, магазинах, пешеходных зонах и при скоплении людей. На детские площадки, пляжи и отмеченные газоны с собаками нельзя.", "Выбор", act("Берлин: Hundegesetz, вопросы и ответы", o.dogFaq), act("Зоны выгула собак в лесах Берлина", o.dogAreas)));
    if (a.leash === "yes") steps.push(step("Освобождение от поводка (по желанию)", "Нужна Sachkundebescheinigung («Hundeführerschein»): экзамен у признанного эксперта (теория 30 вопросов, проходной порог 70%, 45 минут; практика: собаке не менее года). Заявление подаётся лично в Ordnungsamt района; нужны форма, данные собаки, страховка, подтверждение Sachkunde и фото. Сбор по времени обработки: €20,50 за начатые 15 минут, минимум €41–61,50 в зависимости от основания.", "Лично", act("Берлин: освобождение от поводка", o.dogLeash), act("Признанные эксперты Берлина", o.dogExperts)));
  }
  const registryIndex = steps.findIndex((item) => item.title.startsWith("Внесите собаку в Hunderegister"));
  const chipDocs = ["Паспорт животного с 15-значным номером чипа", "Документы о приобретении собаки", ...(listed ? ["Справка о несудимости (Führungszeugnis) владельца", "Подтверждение Sachkunde, страховки и Wesenstest в срок 8 недель"] : [])];
  const variant = (written: boolean): Step[] => steps.map((item, index) => index !== registryIndex ? item : {
    ...item,
    mode: written ? "Звонок" : "Онлайн",
    detail: written
      ? "Сообщите данные письменно по почте или e-mail либо по телефону (GovConnect GmbH). Нужны 15-значный номер чипа из паспорта животного и данные о породе. Стоимость: €26,50 за собаку. Квитанция о стоимости (Kostenbescheid) служит подтверждением. Регистрация в реестре одновременно служит налоговой. Отсутствие регистрации или несообщение об изменениях: административное нарушение со штрафом до €10 000."
      : "Зарегистрируйте собаку онлайн в кабинете владельца на портале реестра. Нужны 15-значный номер чипа из паспорта животного и данные о породе. Стоимость онлайн: €17,50 за собаку. Квитанция о стоимости (Kostenbescheid) служит подтверждением. Регистрация в реестре одновременно служит налоговой. Отсутствие регистрации или несообщение об изменениях: административное нарушение со штрафом до €10 000.",
  });
  const taxFact = { label: "Налоговое уведомление", value: "приходит само примерно через 4 недели", kind: "authority" as const };
  const methods: Method[] = [
    { id: "online", kind: "online", title: "Регистрация онлайн", summary: "Кабинет владельца на портале Hunderegister. Дешевле, чем письменно или по телефону.", availability: "available", availabilityLabel: "Доступно", conditions: ["Номер чипа (15 цифр) и данные о породе под рукой"], documents: chipDocs, facts: [{ label: "Стоимость регистрации онлайн", value: "€17,50 за собаку", kind: "official" }, taxFact], steps: variant(false) },
    { id: "written", kind: "phone", title: "Письменно или по телефону", summary: "Заявление по почте или e-mail либо по телефону (GovConnect GmbH).", availability: "available", availabilityLabel: "Доступно, но дороже", conditions: ["Номер чипа (15 цифр) и данные о породе под рукой"], documents: chipDocs, facts: [{ label: "Стоимость регистрации письменно или по телефону", value: "€26,50 за собаку", kind: "official" }, taxFact], steps: variant(true) },
  ];
  return {
    fit: listed ? "conditional" : "fits",
    why: [listed ? "Порода относится к Listenhunde: действуют обязательные сроки и условия" : "Собака не относится к Listenhunde", "Собака появилась у вас или переезжает с вами в Берлин"],
    title: listed ? "Listenhund в Берлине: порядок действий и строгие сроки" : "Новая собака в Берлине: реестр, налог и правила прогулок",
    summary: (listed ? "Для Pit Bull Terrier, American Staffordshire Terrier, Bull Terrier и их помесей действуют обязательное уведомление Ordnungsamt и сроки в 3 и 8 недель. " : "Для большинства собак достаточно чипа, регистрации в реестре и знания правил о поводке. ") + "Выберите способ регистрации ниже: онлайн или письменно и по телефону.",
    methods,
    steps: methods[0].steps,
    next: { label: "Страховки в Германии", href: "/berlin/obyazatelnye-strahovki" },
    note: listed ? "Любая другая порода или помесь тоже может быть признана опасной по решению Ordnungsamt после инцидента, например укуса. Это общая информация, а не юридическая консультация: сроки и условия указаны на страницах ведомств по ссылкам в шагах." : "Информация основана на официальных страницах Берлина. Сроки и условия указаны на них.",
  };
}

const telecomProvidersNote = "Данные взяты с официальных страниц самих операторов и закона 19 октября 2026 года; тарифы здесь не сравниваются и не оцениваются. Если нужного оператора нет, действуйте по общим шагам выше: порядок идентификации и тарифы оператора указаны на его странице.";
const telecomIdDocs = ["Один действующий документ с фото из перечня закона (§ 172 TKG). Подходит любой из них:", "Удостоверение личности Германии", "Reisepass или иной признанный документ", "Aufenthaltstitel", "Ankunftsnachweis или Aufenthaltsgestattung", "Duldung", "Идентификация проходит один раз до активации SIM-карты предоплаты; её нельзя поручить другому человеку"];
const telecomRemoteProviders: Provider[] = [
      { id: "telekom-contract", name: "Telekom: Handyvertrag", label: "Договор · SIM или eSIM",
        summary: "Договоры на мобильную связь с минимальным сроком и без срока; доставка SIM-карты или eSIM.",
        facts: [{ label: "Что приходит", value: "SIM-карта или eSIM для своего телефона либо SIM/eSIM вместе со смартфоном", kind: "provider" }, { label: "Срок", value: "есть договоры с минимальным сроком и договоры с ежемесячным расторжением", kind: "provider" }],
        links: [act("Telekom: договоры на мобильную связь", o.telekomPhone)] },
  { id: "vodafone-contract", name: "Vodafone: договор на срок", label: "Заказ онлайн · SIM по почте",
    summary: "Для договоров с минимальным сроком SIM-карта приходит по почте и уже активна; eSIM загружается на телефон сама после подключения к Wi-Fi.",
    facts: [{ label: "Доставка SIM", value: "обычно 2–4 рабочих дня", kind: "provider" }, { label: "Получение другим человеком", value: "возможно; для телефона только если вы прошли Online-Ident при заказе", kind: "provider" }],
    conditions: ["Список принимаемых документов для договоров на странице не указан: порядок идентификации показывает форма заказа"],
    links: [act("Vodafone: заказ и доставка", o.vodafoneOrder)] },
  { id: "vodafone-callya", name: "Vodafone CallYa", label: "Предоплата · eID, видео, приложение или почта",
    summary: "Идентификация обязательна для всех новых клиентов предоплаты; ссылка приходит по e-mail, на проверку есть 30 дней после заказа.",
    facts: [{ label: "Способы", value: "eID, видеозвонок, селфи в приложении POSTIDENT, Postfiliale с купоном", kind: "provider" }, { label: "Видеозвонок и селфи", value: "Personalausweis или Reisepass; видео-партнёры доступны с 8 до 22 часов", kind: "provider" }, { label: "eID", value: "Personalausweis или электронный Aufenthaltstitel с включённой онлайн-функцией, PIN из 6 цифр и смартфон с NFC", kind: "provider" }, { label: "Доставка SIM", value: "после успешной идентификации по почте; срок на странице не указан", kind: "provider" }],
    conditions: ["В Postfiliale нужен «gültiges Ausweisdokument» (действующий документ): какие именно, на странице не указано"],
    links: [act("Vodafone CallYa: регистрация и способы", o.vodafoneCallya)] },
  { id: "o2-prepaid", name: "o2 Prepaid", label: "Предоплата · видеочат, смартфон или Postident",
    summary: "SIM-карта приходит по почте; активация обычно занимает несколько минут после проверки.",
    facts: [{ label: "Способы", value: "видеочат IDnow, автоматическая проверка «Identity Online» на смартфоне, PostIdent с купоном в Postfiliale", kind: "provider" }, { label: "Доставка SIM", value: "в течение нескольких дней по почте", kind: "provider" }, { label: "Документ", value: "«gültiges Ausweisdokument, z. B. Personalausweis»; полный список на официальных страницах не приведён", kind: "provider" }],
    conditions: ["Нужны QR-код из письма, номер SIM и дата рождения"],
    links: [act("o2: как активировать SIM", o.o2Activate), act("o2 Hilfe: активация предоплаты", o.o2Faq)] },
  { id: "alditalk", name: "ALDI TALK", label: "Предоплата · видео круглосуточно",
    summary: "Стартовый набор покупается в магазине ALDI, регистрация проходит онлайн или в магазине-партнёре.",
    facts: [{ label: "Стартовый набор", value: "9,99 € с 10 € на счёте; SIM 3-в-1, позже можно перейти на eSIM в приложении", kind: "provider" }, { label: "Способы", value: "видео-идентификация онлайн в любое время (сайт или приложение) или Shop-Ident в более чем 10 000 магазинах-партнёрах", kind: "provider" }, { label: "Документы", value: "например Personalausweis, Reisepass, Aufenthaltstitel с защитными элементами и фото", kind: "provider" }, { label: "Возраст", value: "регистрация с 16 лет", kind: "provider" }],
    conditions: ["Нужны письмо с SIM-номером и PUK 2 и действующий документ", "До оплаты набор не работает"],
    links: [act("ALDI TALK: регистрация", o.alditalkRegister), act("ALDI TALK: частые вопросы", o.alditalkFaq), act("ALDI TALK: стартовый набор", o.alditalkStarter)] },
];
const telecomShopProviders: Provider[] = [
  { id: "alditalk-shop", name: "ALDI TALK: Shop-Ident", label: "Предоплата · магазин-партнёр",
    summary: "Идентификация лично в магазине-партнёре: сотрудник проверяет документ, видео не нужно.",
    facts: [{ label: "Где", value: "более 10 000 магазинов-партнёров; магазин находят через поиск на сайте", kind: "provider" }, { label: "Документы", value: "например Personalausweis, Reisepass, Aufenthaltstitel", kind: "provider" }],
    links: [act("ALDI TALK: регистрация", o.alditalkRegister), act("ALDI TALK: частые вопросы", o.alditalkFaq)] },
  { id: "o2-shop", name: "o2: магазин", label: "Договор · SIM сразу активна",
    summary: "SIM-карта, полученная в магазине o2, уже активна.",
    facts: [{ label: "Что известно", value: "активация SIM в магазине описана на странице o2; документы и сроки на ней не перечислены", kind: "provider" }],
    links: [act("o2: активация SIM", o.o2Activate)] },
  { id: "vodafone-post", name: "Vodafone CallYa: Postfiliale", label: "Предоплата · почтовое отделение",
    summary: "Идентификация в Postfiliale по купону, который приходит от Vodafone.",
    facts: [{ label: "Документ", value: "«gültiges Ausweisdokument»; какие именно, на странице не указано", kind: "provider" }],
    links: [act("Vodafone CallYa: способы", o.vodafoneCallya)] },
];
const telecomNeedLabels: Record<string, string> = { switch: "Вы меняете провайдера или переезжаете", cancel: "Вы расторгаете договор или проверяете срок", problem: "У вас проблема с услугой" };

function wbsPlan(a: Answers): Plan {
  const service = act("ServicePortal Berlin: WBS", o.wbsService);
  const calc = act("Предварительная проверка дохода (калькулятор Сената)", o.wbsCalc);
  const welcome = act("Welcome Center: WBS", o.wbsWelcome);
  if (a.status === "none" || a.status === "short") return {
    fit: "redirect",
    why: [a.status === "none" ? "Вида на жительство у вас пока нет" : "Вид на жительство действует меньше года"],
    title: a.status === "none" ? "WBS пока недоступен: нужен вид на жительство" : "WBS пока недоступен: вид на жительство должен действовать не меньше года",
    summary: "По официальной странице услуги гражданам не из ЕС нужна Aufenthaltserlaubnis (вид на жительство) со сроком действия не меньше одного года. Сначала оформите или продлите документ, потом возвращайтесь к WBS. Искать жильё можно и без WBS.",
    steps: [
      step("Решите вопрос с документом", "Продление документа или оформление нового идёт через ведомство по делам иностранцев LEA. Когда срок действия будет не меньше года, вернитесь к этому маршруту.", "Онлайн", act("Маршрут: продление вида на жительство", "/berlin/aufenthalt"), service),
      step("Пока ищите жильё без WBS", "Искать квартиры можно без WBS. Заявку на квартиру, для которой нужен WBS, подают только с ним: компании указывают это в объявлении.", "Онлайн", act("Маршрут: поиск жилья", "/berlin/wohnungssuche"), welcome),
    ],
    next: act("Маршрут: продление вида на жительство", "/berlin/aufenthalt"),
  };
  if (a.status === "unknown") return {
    fit: "insufficient",
    why: ["Вы не знаете, какой у вас статус"],
    title: "Сначала определите статус пребывания",
    summary: "От статуса зависит право на WBS: гражданам Германии и ЕС достаточно проживания в Берлине, остальным нужен вид на жительство со сроком действия не меньше года.",
    steps: [step("Посмотрите срок действия документа", "Дата окончания указана на карте или в наклейке вашего вида на жительство. Если срок меньше года, WBS пока недоступен. Если не меньше года или вы из ЕС, вернитесь к вопросу о статусе и выберите подходящий ответ.", "Выбор", service, service)],
  };
  if (a.stay === "no") return {
    fit: "redirect",
    why: ["Вы планируете жить в Берлине меньше 11 месяцев"],
    title: "WBS не подойдёт: он рассчитан на проживание от 11 месяцев",
    summary: "По официальной странице услуги WBS могут получить те, кто живёт в Берлине не только временно (не меньше 11 месяцев) и может сделать город центром своей жизни. Для короткого срока ищите временное жильё или комнату.",
    steps: [step("Выберите формат поиска без WBS", "Комнаты, субаренда и временное жильё не требуют WBS. Откройте обзор способов поиска.", "Онлайн", act("Маршрут: поиск жилья", "/berlin/wohnungssuche"), welcome)],
    next: act("Маршрут: поиск жилья", "/berlin/wohnungssuche"),
  };
  const wg = a.household === "wg";
  const unsureStay = a.stay === "unknown";
  const commonDocs = ["Форма заявления", "Справка о ваших доходах и справка от работодателя о доходе", "Копии документов, удостоверяющих личность, всех, кого вы указываете в заявлении", "Если вы не одиноки: свидетельство о браке или заявление о партнёрстве; для детей: свидетельства о рождении и заявление об опеке", "Дополнительно по ситуации: документ об инвалидности, справка об учёбе, документ о праве пребывания"];
  const facts = [
    { label: "Стоимость", value: "бесплатно", kind: "official" as const },
    { label: "Срок действия WBS", value: "как правило один год", kind: "official" as const },
    { label: "Срок рассмотрения", value: "официальная страница услуги срок не называет; Welcome Center пишет, что обработка часто занимает недели или месяцы", kind: "authority" as const },
  ];
  const after = step("После получения WBS", "WBS даёт право подавать заявки на социальные квартиры по всему Берлину, но не гарантирует квартиру. Копию WBS прикладывайте к заявке на квартиру, оригинал передают арендодателю при подписании договора или въезде. Компании указывают в объявлениях, нужен ли WBS и какой.", "Выбор", act("Маршрут: поиск жилья", "/berlin/wohnungssuche"), service);
  const prep = step("Проверьте доход и подготовьте документы", "Размер WBS зависит от годового дохода и состава семьи. Калькулятор Сената даёт ориентир, а решение принимает жилищное ведомство. Подготовьте файлы PDF или JPG, если подаёте онлайн.", "Выбор", calc, service);
  const methods: Method[] = [
    { id: "online", kind: "online", title: "Онлайн-заявление", summary: "Заполните форму на портале Берлина и загрузите документы файлами. Решение придёт по почте.", availability: "available", availabilityLabel: "Доступно", conditions: ["Файлы PDF или JPG: до 5 МБ каждый и до 30 МБ всего", "Подаёте в жилищное ведомство своего района; если ещё не живёте в Берлине, можно выбрать любой берлинский район"], documents: commonDocs, facts, steps: [prep, step("Подайте заявление онлайн", "Заполните форму, приложите документы и отправьте. Сохраните подтверждение отправки.", "Онлайн", act("Подать заявление на WBS онлайн", o.wbsOnline), service), step("Ожидайте решение по почте", "Если ведомство запросит документ, ответьте до указанного срока; при необходимости попросите продлить срок. Решение придёт письмом.", "Ожидание", service, welcome), after] },
    { id: "paper", kind: "mail", title: "Бумажная форма: почтой или лично", summary: "Распечатайте и заполните форму, приложите документы и отправьте или сдайте в районное ведомство.", availability: "available", availabilityLabel: "Доступно", conditions: ["Подпишите форму (все взрослые заявители) и отправьте или сдайте в районное Bürger- или Wohnungsamt; обязательность записи на странице услуги не указана", "Если вы ещё не живёте в Берлине, можно выбрать любое берлинское ведомство"], documents: commonDocs, facts, steps: [prep, step("Распечатайте и подпишите форму", "Скачайте официальную форму, заполните и подпишите её, приложите копии документов.", "Выбор", act("Форма заявления на WBS (PDF)", o.wbsForm), service), step("Отправьте или сдайте в ведомство района", "Адрес жилищного ведомства или Bürgeramt вашего района указан на странице услуги. Отправьте почтой или сдайте лично; обязательность записи на странице услуги не указана.", "Лично", service, welcome), step("Ожидайте решение по почте", "Если ведомство запросит документ, ответьте до указанного срока. Решение придёт письмом.", "Ожидание", service, welcome), after] },
  ];
  const why = [a.status === "eu" ? "Вы гражданин Германии или ЕС" : "Ваш вид на жительство действует не меньше года", a.stay === "yes" ? "Вы планируете жить в Берлине не меньше 11 месяцев" : "Срок проживания в Берлине вы пока не знаете", wg ? "Вы подаёте для квартиры совместного проживания" : a.household === "family" ? "Вы подаёте для семьи или пары" : "Вы подаёте для себя"];
  return {
    fit: unsureStay ? "conditional" : "fits",
    why,
    title: "Вы можете подать заявление на WBS",
    summary: "WBS (Wohnberechtigungsschein: разрешение на аренду социального жилья) выдаёт жилищное ведомство вашего района. Выберите способ подачи." + (unsureStay ? " Условие: вы должны жить в Берлине не только временно, не меньше 11 месяцев." : "") + (wg ? " Для WG общее заявление соседей и объединение отдельных WBS невозможны: каждый подаёт своё." : ""),
    methods,
    steps: methods[0].steps,
    next: act("Маршрут: поиск жилья", "/berlin/wohnungssuche"),
    note: "Некоторые социальные квартиры сдают только владельцам WBS с особой потребностью (например, семья с детьми в тесной квартире или инвалидность 50 и выше); для них нужно не менее года регистрации в Берлине и документы, подтверждающие основание. Укажите основание в заявлении.",
  };
}

export function everydayPlan(id: "bank" | "telecom" | "dog" | "wbs", a: Answers): Plan {
  if (id === "wbs") return wbsPlan(a);
  if (id === "bank") return bankPlan(a);
  if (id === "telecom") {
    const plan = telecomPlan(a);
    return { fit: "fits", why: a.need ? [telecomNeedLabels[a.need]].filter(Boolean) : [], ...plan };
  }
  return dogPlan(a);
}
