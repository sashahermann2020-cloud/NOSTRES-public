"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  checkedAt,
  getAvailableActionMethods,
  getPersonalizedResult,
  getVisibleQuestions,
  journeys,
  sourceDirectory,
  type Journey,
} from "./nostres-data";

type SavedRoute = {
  answers: Record<string, string>;
  doneSteps: number[];
  methodId?: string;
  outcome?: string;
  updatedAt: string;
};

type SavedRoutes = Record<string, SavedRoute>;

import ExplainedText from "./ExplainedText";
import { ROUTE_STORAGE_KEY as STORAGE_KEY, readRouteProgress } from "./progress-storage";
import { APP_VERSION } from "./version";
import { tr, trDeep, trf, useLocale, lh } from "./i18n/store";
import ShareButton from "./ShareButton";
import InstallButton from "./InstallButton";
import HeaderTools from "./i18n/HeaderTools";
import GroupedGrid from "./GroupedGrid";
import { THEMES, themeOf, inTheme } from "./route-themes";
import PlacePicker from "./PlacePicker";
const fullRoutePaths: Record<string, string> = {
  anmeldung: "/berlin/anmeldung",
  "tax-id": "/berlin/steuer-id",
  health: "/berlin/health-insurance",
};

const publishedJourneys = journeys.filter((journey) => Boolean(fullRoutePaths[journey.id]));
const publishedCategories = ["Все", ...THEMES];
const searchAliases: Record<string, string[]> = {
  anmeldung: ["пропис", "регистрац", "адрес", "anmeldung", "bürgeramt", "wohnungsgeber", "meldebestätigung"],
  "tax-id": ["налог", "steuer", "idnr", "finanzamt", "номер", "tax", "steueridentifikationsnummer"],
  health: ["страхов", "медицин", "krankenkasse", "gkv", "pkv", "egk", "health", "кранкенкасс"],
  housing: ["квартир", "жиль", "аренд", "снять", "комнат", "schufa", "wbs", "wohnung", "wohnen"],
  lea: ["внж", "жительств", "миграц", "lea", "aufenthalt", "продл", "виз", "ведомств"],
  doctor: ["врач", "доктор", "прием", "запис", "практик", "hausarzt", "facharzt", "психотерап"],
  urgent: ["сроч", "экстр", "скорая", "неотлож", "дежур", "112", "116117"],
  bank: ["банк", "счет", "счёт", "basiskonto", "girokonto", "bafin", "sparkasse", "dkb", "карт"],
  telecom: ["связ", "интернет", "телефон", "мобильн", "сим", "договор", "тариф", "роутер", "провайдер"],
  wbs: ["wbs", "вбс", "социальн", "wohnberechtigungsschein", "разрешение на жиль"],
  kindergeld: ["kindergeld", "детск", "пособи", "ребен", "ребён", "familienkasse", "ребенок"],
  jobcenter: ["jobcenter", "джобцентр", "безработ", "arbeitslos", "arbeitsagentur", "потер", "уволь", "увольн", "пособие по безработ", "bürgergeld", "бюргергельд", "grundsicherung", "работ"],
  kita: ["kita", "кита", "детский сад", "детсад", "садик", "gutschein", "школ", "schule", "первый класс", "рожден", "geburt", "standesamt", "свидетельство о рожден", "ребен", "ребён"],
  elterngeld: ["elterngeld", "элтергельд", "декрет", "родительск", "рожден", "беременн", "материнск", "mutterschaftsgeld", "elternzeit"],
  kinderzuschlag: ["kinderzuschlag", "киндерцушлаг", "доплата", "малообеспеч", "низк", "семья с небольшим доходом", "ребен", "ребён"],
  steuererklaerung: ["steuererklärung", "steuererklarung", "декларац", "возврат налог", "налог", "elster", "эльстер", "finanzamt", "налоговая"],
  elternzeit: ["elternzeit", "родительск", "отпуск по уходу", "декрет", "отпуск", "рожден", "ребен", "ребён"],
  mutterschutz: ["mutterschutz", "mutterschaftsgeld", "декрет", "беремен", "роды", "материнств", "пособие по беременности", "schwanger"],
  pflegegeld: ["pflegegeld", "pflegegrad", "pflegekasse", "пособие по уходу", "уход за", "уход", "пожил", "больной родственник", "инвалид"],
  schwerbehinderung: ["schwerbehinderung", "schwerbehindertenausweis", "gdb", "инвалидность", "инвалид", "ausweis", "merkzeichen", "gleichstellung"],
  wohnungsgeber: ["wohnungsgeberbestätigung", "wohnungsgeberbestaetigung", "подтверждение заселения", "арендодатель", "хозяин квартиры", "справка от хозяина"],
  arbeitslosengeld: ["arbeitslosengeld", "пособие по безработице", "безработиц", "потерял работу", "уволили", "sperrzeit", "alg"],
  grundsicherungsgeld: ["grundsicherungsgeld", "grundsicherung", "bürgergeld", "burgergeld", "бюргергельд", "социальное пособие", "jobcenter", "нет денег"],
  kfz: ["kfz", "ummeldung auto", "ummelden", "fahrzeug", "car", "vehicle", "мотоцикл", "motorrad", "kraftrad", "автомобиль", "машина", "номера", "zulassung", "перерегистрация авто", "kennzeichen"],
  workpermit: ["blue card", "blaue karte", "рабочая виза", "вид на жительство для работы", "fachkraft", "chancenkarte", "aufenthaltstitel", "виза для работы"],
  recognition: ["anerkennung", "признание диплома", "подтвержден", "подтвердить", "признани", "recognition", "нострификация", "диплом", "признание квалификации", "zab", "anabin"],
  sprachkurs: ["язык", "курс", "курсы", "учить", "немецкий", "английский", "sprachkurs", "deutschkurs", "vhs", "goethe", "гёте", "школа языков", "языков", "berufssprachkurs", "telc", "testdaf", "экзамен по немецкому"],
  study: ["учёб", "учеб", "универ", "вуз", "студент", "поступ", "аусбильдунг", "ausbildung", "studium", "studienkolleg", "uni-assist", "bachelor", "master", "магистр", "бакалавр", "колледж", "fachhochschule", "профессиональное обучение", "на английском"],
  reunion: ["familiennachzug", "воссоединение семьи", "виза супруга", "виза для мужа", "виза для жены", "привезти ребёнка", "семейная виза"],
  language: ["integrationskurs", "интеграционный курс", "языковой курс", "курс немецкого", "bamf", "dtz", "berufssprachkurs"],
  einbuergerung: ["einbürgerung", "einbuergerung", "гражданство", "citizenship", "staatsangehörigkeit", "паспорт германии", "натурализация", "naturalisation", "b1 сертификат", "einbürgerungstest"],
  umzug: ["umzug", "переезд", "ummeldung", "смена адреса", "новый адрес", "переехал", "переехала"],
  bildungspaket: ["bildungspaket", "teilhabepaket", "berlinpass", "школьн", "обед в школе", "репетитор", "кружок", "досуг", "канцеляр", "школа"],
  wohngeld: ["wohngeld", "вогельд", "жилищн", "доплата за жиль", "аренд", "квартплат", "жиль", "мало доход", "wohnung"],
  employment: ["работ", "вакан", "найм", "stellen", "jobsuche", "arbeit", "зарплат", "mindestlohn", "минимальн", "работодател", "трудов", "разрешение на работ"],
  dog: ["собак", "hund", "пес", "пёс", "hunde", "порода", "hunderegister", "hundesteuer", "налог на собак"],
  petmove: ["животн", "питом", "кошк", "кот", "собак", "хорёк", "хорек", "птиц", "попуга", "переезд с", "ввоз", "бешенств", "чип", "einreise", "tollwut", "haustier", "heimtier"],
  petpass: ["паспорт животн", "паспорт собак", "паспорт кош", "heimtierausweis", "heimtierpass", "ветпаспорт", "паспорт питом", "pet passport", "животн", "питом"],
  vet: ["ветерин", "ветврач", "tierarzt", "tierärzt", "tierklinik", "ветклиник", "животн", "питом", "кошк", "собак", "прививк"],
  dogtrainer: ["дрессир", "кинолог", "hundeschule", "hundetrainer", "hundeführerschein", "sachkunde", "поводок", "без поводка", "wesenstest", "собак"],
  transport: ["транспорт", "билет", "проезд", "Deutschlandticket", "deutschlandticket", "vbb", "berlin-ticket", "schülerticket", "семестровый", "проездной"],
  culture: ["музей", "музе", "культур", "досуг", "театр", "концерт", "событие", "мероприят", "льготы на культуру", "familienpass", "fairgnuegen", "kulturleben"],
  relocation: ["переезд", "переех", "эмигр", "иммигр", "виз", "visum", "уехать", "working", "holiday"],
  chancenkarte: ["chancenkarte", "шанс", "opportunity", "балл", "punkte", "поиск работы"],
  workvisa: ["blue", "blaue", "рабоч", "виз", "vorabzustimmung", "westbalkan", "anerkennungspartnerschaft", "fachkraft"],
  volunteer: ["волонт", "freiwillig", "bundesfreiwilligendienst", "bfd", "fsj", "föj", "foej", "солидарност", "solidarity", "esc"],
  company: ["gmbh", "ug", "компани", "фирм", "уставн", "stammkapital", "handelsregister", "нотариус", "haftungsbeschränkt", "юрлиц", "company"],
  socialnumber: ["социальн", "соцстрах", "sozialversicherung", "versicherungsnummer", "rentenversicherung", "страховой", "social", "krankenversichertennummer", "egk"],
  settlement: ["niederlassung", "бессрочн", "постоянн", "пмж", "permanent", "daueraufenthalt", "settlement"],
  mental: ["психич", "психиатр", "психотерап", "депресс", "тревог", "кризис", "паническ", "суицид", "psychiat", "psychother", "psychisch", "krise", "krisendienst", "mental", "depression", "therapy", "therapie", "sozialpsychiatr"],
  notary: ["нотари", "notar", "notary", "beurkundung", "gnotkg", "заверен", "notarkosten"],
  studyvisa: ["студенч", "учебн", "виз", "sperrkonto", "блокирован", "studienbewerbung", "студент", "поступ"],
  business: ["предприним", "самостоятель", "фриланс", "бизнес", "gewerbe", "elster", "freiberuf", "деятельност"],
};
const searchStopwords = new Set(["как", "мне", "можно", "берлин", "берлине", "германи", "германии", "найти", "получить", "сделать", "оформить", "нужно", "если", "для", "без", "где"]);
function intentWords(query: string) {
  return query.toLowerCase().replaceAll("ё", "е").split(/[^\p{L}\p{N}-]+/u).filter((word) => word.length > 2 && !searchStopwords.has(word));
}
function matchesIntent(id: string, words: string[]) {
  if (!words.length) return true;
  return words.some((word) => searchAliases[id]?.some((alias) => word.startsWith(alias.replaceAll("ё", "е"))));
}

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function SearchIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.3" cy="8.3" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="m12.4 12.4 4 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></svg>;
}

function ExternalIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M11 4h5v5M9 11l7-7M16 12v4H4V4h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
}

function CheckIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>;
}

function saveRoutesToDevice(routes: SavedRoutes) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
  } catch {
    // The product still works if the browser blocks local storage.
  }
}

export default function Home() {
  useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все");
  const [scope, setScope] = useState("Все уровни");
  const [status, setStatus] = useState("all");
  const [life, setLife] = useState("all");
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [outcome, setOutcome] = useState("");
  const [savedRoutes, setSavedRoutes] = useState<SavedRoutes>({});
  const dialogRef = useRef<HTMLElement>(null);
  const launcherRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = readRouteProgress();
        if (stored) setSavedRoutes(JSON.parse(stored) as SavedRoutes);
      } catch {
        setSavedRoutes({});
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!selectedJourney) {
      launcherRef.current?.focus();
      return;
    }
    const dialog = dialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])") ?? []).filter((element) => element.getClientRects().length > 0 && !element.closest("[aria-hidden='true'], [hidden], details:not([open])"));
    focusable()[0]?.focus();
    function keepFocusInDialog(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedJourney(null);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) { event.preventDefault(); dialog?.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog?.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog?.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    }
    window.addEventListener("keydown", keepFocusInDialog);
    return () => window.removeEventListener("keydown", keepFocusInDialog);
  }, [selectedJourney]);

  const matchingJourneys = useMemo(() => {
    const words = intentWords(query);
    return publishedJourneys.filter((journey) => {
      const matchesQuery = matchesIntent(journey.id, words);
      const matchesCategory = inTheme(journey.id, category);
      const matchesScope = scope === "Все уровни" || journey.scope === scope;
      const matchesStatus = status === "all" || journey.audience.includes(status) || journey.audience.includes("all");
      const matchesLife = life === "all" || journey.life.includes(life) || journey.life.includes("all");
      return matchesQuery && matchesCategory && matchesScope && matchesStatus && matchesLife;
    });
  }, [query, category, scope, status, life]);
  const housingMatches = inTheme("housing", category)
    && (scope === "Все уровни" || scope === "Берлин")
    && matchesIntent("housing", intentWords(query));
  const leaMatches = inTheme("lea", category)
    && (scope === "Все уровни" || scope === "Берлин")
    && matchesIntent("lea", intentWords(query));
  const doctorMatches = inTheme("doctor", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("doctor", intentWords(query));
  const urgentMatches = inTheme("urgent", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("urgent", intentWords(query));
  const businessMatches = inTheme("business", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "business") && matchesIntent("business", intentWords(query));
  const bankMatches = inTheme("bank", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("bank", intentWords(query));
  const telecomMatches = inTheme("telecom", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("telecom", intentWords(query));
  const wbsMatches = inTheme("wbs", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("wbs", intentWords(query));
  const kindergeldMatches = inTheme("kindergeld", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "family") && matchesIntent("kindergeld", intentWords(query));
  const jobcenterMatches = inTheme("jobcenter", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "business") && matchesIntent("jobcenter", intentWords(query));
  const kitaMatches = inTheme("kita", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "family") && matchesIntent("kita", intentWords(query));
  const employmentMatches = inTheme("employment", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "work") && matchesIntent("employment", intentWords(query));
  const elterngeldMatches = inTheme("elterngeld", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "family") && matchesIntent("elterngeld", intentWords(query));
  const kinderzuschlagMatches = inTheme("kinderzuschlag", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "family") && matchesIntent("kinderzuschlag", intentWords(query));
  const taxFilingMatches = inTheme("steuererklaerung", category) && (scope === "Все уровни" || scope === "Германия") && (life === "all" || life === "work" || life === "business") && matchesIntent("steuererklaerung", intentWords(query));
  const elternzeitMatches = inTheme("elternzeit", category) && (scope === "Все уровни" || scope === "Германия") && (life === "all" || life === "family" || life === "work") && matchesIntent("elternzeit", intentWords(query));
  const wohngeldMatches = inTheme("wohngeld", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("wohngeld", intentWords(query));
  const dogMatches = inTheme("dog", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "family") && matchesIntent("dog", intentWords(query));
  const mutterschutzMatches = inTheme("mutterschutz", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "family") && matchesIntent("mutterschutz", intentWords(query));
  const bildungspaketMatches = inTheme("bildungspaket", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "family") && matchesIntent("bildungspaket", intentWords(query));
  const pflegegeldMatches = inTheme("pflegegeld", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("pflegegeld", intentWords(query));
  const schwerbehinderungMatches = inTheme("schwerbehinderung", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("schwerbehinderung", intentWords(query));
  const wohnungsgeberMatches = inTheme("wohnungsgeber", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("wohnungsgeber", intentWords(query));
  const umzugMatches = inTheme("umzug", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("umzug", intentWords(query));
  const arbeitslosengeldMatches = inTheme("arbeitslosengeld", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("arbeitslosengeld", intentWords(query));
  const grundsicherungsgeldMatches = inTheme("grundsicherungsgeld", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("grundsicherungsgeld", intentWords(query));
  const kfzMatches = inTheme("kfz", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("kfz", intentWords(query));
  const einbuergerungMatches = inTheme("einbuergerung", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("einbuergerung", intentWords(query));
  const workpermitMatches = inTheme("workpermit", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("workpermit", intentWords(query));
  const recognitionMatches = inTheme("recognition", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("recognition", intentWords(query));
  const languageMatches = inTheme("language", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("language", intentWords(query));
  const reunionMatches = inTheme("reunion", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("reunion", intentWords(query));
  const sprachkursMatches = inTheme("sprachkurs", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("sprachkurs", intentWords(query));
  const studyMatches = inTheme("study", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("study", intentWords(query));
  const petmoveMatches = inTheme("petmove", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "family") && matchesIntent("petmove", intentWords(query));
  const petpassMatches = inTheme("petpass", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "family") && matchesIntent("petpass", intentWords(query));
  const vetMatches = inTheme("vet", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "family") && matchesIntent("vet", intentWords(query));
  const dogtrainerMatches = inTheme("dogtrainer", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "family") && matchesIntent("dogtrainer", intentWords(query));
  const transportMatches = inTheme("transport", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("transport", intentWords(query));
  const cultureMatches = inTheme("culture", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("culture", intentWords(query));
  const relocationMatches = inTheme("relocation", category) && (scope === "Все уровни" || scope === "Германия") && matchesIntent("relocation", intentWords(query));
  const chancenkarteMatches = inTheme("chancenkarte", category) && (scope === "Все уровни" || scope === "Германия") && (life === "all" || life === "work") && matchesIntent("chancenkarte", intentWords(query));
  const workvisaMatches = inTheme("workvisa", category) && (scope === "Все уровни" || scope === "Германия") && (life === "all" || life === "work") && matchesIntent("workvisa", intentWords(query));
  const volunteerMatches = inTheme("volunteer", category) && (scope === "Все уровни" || scope === "Германия") && matchesIntent("volunteer", intentWords(query));
  const companyMatches = inTheme("company", category) && (scope === "Все уровни" || scope === "Берлин") && (life === "all" || life === "business") && matchesIntent("company", intentWords(query));
  const socialnumberMatches = inTheme("socialnumber", category) && (scope === "Все уровни" || scope === "Германия") && (life === "all" || life === "work") && matchesIntent("socialnumber", intentWords(query));
  const settlementMatches = inTheme("settlement", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("settlement", intentWords(query));
  const mentalMatches = inTheme("mental", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("mental", intentWords(query));
  const notaryMatches = inTheme("notary", category) && (scope === "Все уровни" || scope === "Берлин") && matchesIntent("notary", intentWords(query));
  const studyvisaMatches = inTheme("studyvisa", category) && (scope === "Все уровни" || scope === "Германия") && matchesIntent("studyvisa", intentWords(query));
  const matchingCount = matchingJourneys.length + Number(housingMatches) + Number(leaMatches) + Number(doctorMatches) + Number(urgentMatches) + Number(businessMatches) + Number(bankMatches) + Number(telecomMatches) + Number(dogMatches) + Number(petmoveMatches) + Number(petpassMatches) + Number(vetMatches) + Number(dogtrainerMatches) + Number(transportMatches) + Number(cultureMatches) + Number(relocationMatches) + Number(chancenkarteMatches) + Number(workvisaMatches) + Number(volunteerMatches) + Number(studyvisaMatches) + Number(notaryMatches) + Number(mentalMatches) + Number(settlementMatches) + Number(socialnumberMatches) + Number(companyMatches) + Number(wbsMatches) + Number(kindergeldMatches) + Number(jobcenterMatches) + Number(kitaMatches) + Number(employmentMatches) + Number(elterngeldMatches) + Number(kinderzuschlagMatches) + Number(taxFilingMatches) + Number(elternzeitMatches) + Number(wohngeldMatches) + Number(mutterschutzMatches) + Number(bildungspaketMatches) + Number(pflegegeldMatches) + Number(schwerbehinderungMatches) + Number(wohnungsgeberMatches) + Number(umzugMatches) + Number(arbeitslosengeldMatches) + Number(grundsicherungsgeldMatches) + Number(kfzMatches) + Number(einbuergerungMatches) + Number(workpermitMatches) + Number(recognitionMatches) + Number(languageMatches) + Number(reunionMatches) + Number(sprachkursMatches) + Number(studyMatches);

  const viewJourney = selectedJourney ? trDeep(selectedJourney) : null;
  const visibleQuestions = trDeep(selectedJourney ? getVisibleQuestions(selectedJourney, answers) : []);
  const personalizedResult = trDeep(selectedJourney ? getPersonalizedResult(selectedJourney.id, answers) : null);
  const availableMethods = trDeep(selectedJourney ? getAvailableActionMethods(selectedJourney, answers) : []);
  const selectedMethod = availableMethods.find((method) => method.id === selectedMethodId) ?? null;
  const activeSteps = selectedMethod?.steps ?? viewJourney?.steps ?? [];
  const startedRoutes = Object.keys(savedRoutes).filter((id) => ["housing", "lea", "doctor", "urgent", "business", "bank", "telecom", "dog", "wbs", "kindergeld", "jobcenter", "kita", "employment", "elterngeld", "kinderzuschlag", "steuererklaerung", "elternzeit", "wohngeld", "mutterschutz", "bildungspaket", "pflegegeld", "schwerbehinderung", "wohnungsgeber", "umzug", "arbeitslosengeld", "grundsicherungsgeld", "kfz", "einbuergerung", "workpermit", "recognition", "language", "reunion", "sprachkurs", "study", "petmove", "petpass", "vet", "dogtrainer", "transport", "culture", "relocation", "chancenkarte", "workvisa", "volunteer", "studyvisa", "company", "socialnumber", "settlement", "notary", "mental"].includes(id) || publishedJourneys.some((journey) => journey.id === id));
  const completedRoutes = startedRoutes.filter((id) => {
    if (id === "housing") return savedRoutes[id]?.outcome === "received" || savedRoutes[id]?.outcome === "ready";
    if (id === "lea") return savedRoutes[id]?.outcome === "received";
    if (["doctor", "urgent", "business", "bank", "telecom", "dog", "wbs", "kindergeld", "jobcenter", "kita", "employment", "elterngeld", "kinderzuschlag", "steuererklaerung", "elternzeit", "wohngeld", "mutterschutz", "bildungspaket", "pflegegeld", "schwerbehinderung", "wohnungsgeber", "umzug", "arbeitslosengeld", "grundsicherungsgeld", "kfz", "einbuergerung", "workpermit", "recognition", "language", "reunion", "sprachkurs", "study", "petmove", "petpass", "vet", "dogtrainer", "transport", "culture", "relocation", "chancenkarte", "workvisa", "volunteer", "studyvisa", "company", "socialnumber", "settlement", "notary", "mental"].includes(id)) return savedRoutes[id]?.outcome === "received";
    const route = publishedJourneys.find((journey) => journey.id === id);
    const saved = savedRoutes[id];
    const method = route?.actionMethods?.find((item) => item.id === saved?.methodId);
    const requiredSteps = method?.steps.length ?? route?.steps.length ?? 0;
    return route && requiredSteps > 0 && saved?.doneSteps.length === requiredSteps && saved.outcome === "received";
  });

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    document.getElementById("situations")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetFilters() {
    setQuery("");
    setCategory("Все");
    setScope("Все уровни");
    setStatus("all");
    setLife("all");
  }

  function openJourney(journey: Journey, launcher: HTMLElement) {
    launcherRef.current = launcher;
    const saved = savedRoutes[journey.id];
    setAnswers(saved?.answers ?? {});
    setDoneSteps(saved?.doneSteps ?? []);
    setSelectedMethodId(saved?.methodId ?? "");
    setOutcome(saved?.outcome ?? "");
    setSelectedJourney(journey);
  }

  function persistJourney(journey: Journey, nextAnswers: Record<string, string>, nextSteps: number[], methodId = selectedMethodId, nextOutcome = outcome) {
    const nextRoutes = {
      ...savedRoutes,
      [journey.id]: { answers: nextAnswers, doneSteps: nextSteps, methodId: methodId || undefined, outcome: nextOutcome || undefined, updatedAt: new Date().toISOString() },
    };
    setSavedRoutes(nextRoutes);
    saveRoutesToDevice(nextRoutes);
  }

  function answerQuestion(questionId: string, value: string) {
    if (!selectedJourney) return;
    const nextAnswers = { ...answers, [questionId]: value };
    setAnswers(nextAnswers);
    setSelectedMethodId("");
    setDoneSteps([]);
    setOutcome("");
    persistJourney(selectedJourney, nextAnswers, [], "", "");
  }

  function toggleStep(index: number) {
    if (!selectedJourney) return;
    const nextSteps = doneSteps.includes(index) ? doneSteps.filter((item) => item !== index) : [...doneSteps, index].sort();
    setDoneSteps(nextSteps);
    persistJourney(selectedJourney, answers, nextSteps);
  }

  function chooseMethod(methodId: string) {
    if (!selectedJourney) return;
    setSelectedMethodId(methodId);
    setDoneSteps([]);
    setOutcome("");
    persistJourney(selectedJourney, answers, [], methodId, "");
  }

  function setRouteOutcome(nextOutcome: string) {
    if (!selectedJourney) return;
    setOutcome(nextOutcome);
    persistJourney(selectedJourney, answers, doneSteps, selectedMethodId, nextOutcome);
  }

  return (
    <main id="top" tabIndex={-1}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label={tr("NOSTRES — на главную")}>
          <span className="brand-mark" aria-hidden="true">N</span>
          <span className="brand-copy"><b>NOSTRES</b><small>{tr("Понятный путь")}</small></span>
        </a>
        <nav className="main-nav" aria-label={tr("Основная навигация")}>
          <a href={lh("/berlin/start")}>{tr("Составить план")}</a>
          <a href="#situations">{tr("Маршруты")}</a>
          <a href="#sources">{tr("Источники")}</a>
          <a href="#help">{tr("Помощь")}</a>
        </nav>
        <div className="header-actions">
          <a className="pilot-badge header-test-link" href={lh("/mvp-test")}>{tr("Помогите протестировать сервис")}</a>
          <HeaderTools />
        </div>
      </header>

      <section className="workspace">
        <div className="workspace-heading">
          <div>
            <PlacePicker />
            <h1>{tr("С чего начать в Берлине?")}</h1>
          </div>
          <div className="intro-copy">
            <p className="lede">{tr("Расскажите, где вы сейчас и что уже оформлено. NOSTRES помогает выстроить понятную последовательность дел после переезда: от регистрации и документов до жилья, страхования, медицины и работы. Сейчас план охватывает маршруты Берлина.")}</p>
            <div className="trust-inline"><span><CheckIcon /></span>  {tr("Проверяем источники и показываем следующий шаг")}</div>
            <p className="intro-support">{tr("Трудно прийти в ведомство или звонить? Укажите это в плане: NOSTRES покажет подтверждённые способы и обозначит, когда личный визит необходим.")} <a href={lh("/about")}>{tr("Как помогает NOSTRES")}</a></p>
          </div>
        </div>

        <div className="start-home-cta"><div><strong>{tr("Не знаете, какие действия нужны?")}</strong><p>{tr("Сначала получите личный список. В нём видно, что делать сейчас, что позже, а что проверить отдельно.")}</p></div><a className="primary-action" href={lh("/berlin/start")}>{tr("Составить мой план →")}</a></div>
        <nav className="topic-links" aria-label={tr("Практические темы")}><span>{tr("Также по ситуации:")}</span><a href={lh("/berlin/familie-deti")}>{tr("Семья и дети")}</a><a href={lh("/berlin/sobaka/marshrut")}>{tr("Собака: регистрация, налог, опасные породы")}</a><a href={lh("/berlin/pereezd-s-zhivotnym")}>{tr("Переезд с животным")}</a><a href={lh("/berlin/veterinar")}>{tr("Ветеринар")}</a><a href={lh("/berlin/bank")}>{tr("Банковский счёт")}</a><a href={lh("/berlin/svyaz")}>{tr("Мобильная связь и интернет")}</a><a href={lh("/berlin/obyazatelnye-strahovki")}>{tr("Обязательные страховки")}</a></nav>

        <form className="route-builder" onSubmit={submitSearch}>
          <div className="route-builder-top">
            <label className="search-field">
              <span>{tr("Опишите ситуацию")}</span>
              <span className="input-shell"><SearchIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tr("Например: прописка, квартира, страховка…")} /></span>
            </label>
            <button className="primary-action" type="submit">{tr("Найти маршрут")} <ArrowIcon /></button>
          </div>
          <div className="route-controls">
            <label><span>{tr("Статус")}</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">{tr("Все статусы")}</option><option value="nonEU">{tr("Страна вне ЕС")}</option><option value="eu">{tr("Гражданин ЕС / Европейской экономической зоны")}</option><option value="ukraine">{tr("Временная защита §24")}</option><option value="protection">{tr("Убежище / отсрочка депортации (Duldung)")}</option></select></label>
            <label><span>{tr("Ситуация")}</span><select value={life} onChange={(event) => setLife(event.target.value)}><option value="all">{tr("Любая")}</option><option value="work">{tr("Работаю")}</option><option value="business">{tr("Открываю дело")}</option><option value="family">{tr("Семья и дети")}</option><option value="study">{tr("Учусь")}</option></select></label>
            <label><span>{tr("Уровень правила")}</span><select value={scope} onChange={(event) => setScope(event.target.value)}><option>{tr("Все уровни")}</option><option>{tr("Берлин")}</option><option>{tr("Германия")}</option></select></label>
          </div>
          <div className="route-summary">
            <span className="status-dot" />
            
            {tr("Найдено")} {matchingCount}  {tr("· сохранено")} {startedRoutes.length}  {tr("· завершено")} {completedRoutes.length}
          </div>
        </form>
      </section>

      <section className="section situations" id="situations">
        <div className="section-heading compact-heading">
          <div><p className="overline">{tr("Берлин")}</p><h2>{tr("Маршруты по вашей задаче")}</h2></div>
          <p>{tr("Пятьдесят три маршрута ведут от ответов на вопросы к официальному действию: переезд и визы, документы, здоровье, жильё, работа, пособия, транспорт и досуг.")}</p>
        </div>
        <div className="filter-row" aria-label={tr("Фильтр категорий")}>
          {publishedCategories.map((item) => <button className={category === item ? "filter-chip active" : "filter-chip"} type="button" key={item} onClick={() => setCategory(item)}>{tr(item)}</button>)}
        </div>
        <GroupedGrid flat={category !== "Все" || scope !== "Все уровни" || status !== "all" || life !== "all" || query.trim().length > 0}>
          {matchingJourneys.map((rawJourney) => {
            const journey = trDeep(rawJourney);
            const saved = savedRoutes[journey.id];
            const savedMethod = journey.actionMethods?.find((method) => method.id === saved?.methodId);
            const requiredSteps = savedMethod?.steps.length ?? journey.steps.length;
            const progress = saved ? Math.round((saved.doneSteps.length / requiredSteps) * 100) : 0;
            return (
              <article className={`journey-card ${journey.accent}`} data-cat={themeOf(journey.id)} key={journey.id}>
                <div className="card-meta"><span>{tr(themeOf(journey.id))}</span><span className="scope-pill">{journey.scope}</span></div>
                <h3><ExplainedText text={journey.title} /></h3>
                <p>{journey.summary}</p>
                <div className="route-facts"><span>{journey.actionMethods ? trf("до {n} вопросов", { n: journey.questions.length }) : trf("{n} вопроса", { n: journey.questions.length })}</span><span>{journey.time}</span></div>
                {fullRoutePaths[journey.id] && <span className="route-ready-label"><CheckIcon />  {tr("Полный самостоятельный маршрут")}</span>}
                {saved && <div className="card-progress"><div><span style={{ width: `${progress}%` }} /></div><small>{progress === 100 ? tr("Шаги выполнены") : trf("Прогресс {n}%", { n: progress })}</small></div>}
                {fullRoutePaths[journey.id]
                  ? <a className="card-action" href={lh(fullRoutePaths[journey.id])}>{saved ? tr("Продолжить") : tr("Начать маршрут")} <ArrowIcon /></a>
                  : <button className="card-action" type="button" onClick={(event) => openJourney(journey, event.currentTarget)}>{saved ? tr("Продолжить") : tr("Начать маршрут")} <ArrowIcon /></button>}
              </article>
            );
          })}
          {housingMatches && <article className="journey-card sand" data-cat={themeOf("housing")}><div className="card-meta"><span>{tr(themeOf("housing"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Wohnungssuche</span> <small className="term-note">{tr("(поиск квартиры или комнаты)")}</small></h3><p>{tr("Определить, какие документы есть для заявки, где искать жильё и как проверить возможность регистрации адреса.")}</p><div className="route-facts"><span>{tr("5 вопросов")}</span><span>{tr("Подготовка к поиску")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("План действий по вашей ситуации")}</span>{savedRoutes.housing && <div className="card-progress"><small>{savedRoutes.housing.outcome === "ready" ? tr("План подготовлен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/wohnungssuche")}>{savedRoutes.housing ? tr("Продолжить") : tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {leaMatches && <article className="journey-card lilac" data-cat={themeOf("lea")}><div className="card-meta"><span>{tr(themeOf("lea"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Aufenthaltstitel</span> <small className="term-note">{tr("(продление вида на жительство)")}</small></h3><p>{tr("Выбрать услугу LEA по действующему документу и основанию проживания, подать заявление онлайн и прийти на назначенный приём.")}</p><div className="route-facts"><span>{tr("4 вопроса")}</span><span>{tr("Онлайн → лично")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные формы и сроки")}</span>{savedRoutes.lea && <div className="card-progress"><small>{savedRoutes.lea.outcome === "received" ? tr("Документ получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/aufenthalt")}>{savedRoutes.lea ? tr("Продолжить") : tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {doctorMatches && <article className="journey-card mint" data-cat={themeOf("doctor")}><div className="card-meta"><span>{tr(themeOf("doctor"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Arztsuche</span> <small className="term-note">{tr("(поиск врача и запись)")}</small></h3><p>{tr("Выбрать практику, записаться официальным способом и подготовиться к визиту.")}</p><div className="route-facts"><span>{tr("до 4 вопросов")}</span><span>{tr("Поиск → приём")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные способы записи")}</span><a className="card-action" href={lh("/berlin/vrach")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {urgentMatches && <article className="journey-card coral" data-cat={themeOf("urgent")}><div className="card-meta"><span>{tr(themeOf("urgent"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Notfall</span> <small className="term-note">{tr("(срочная медицинская помощь)")}</small></h3><p>{tr("Выбрать 112, 116117 или дежурную практику по срочности обращения.")}</p><div className="route-facts"><span>{tr("до 2 вопросов")}</span><span>{tr("Куда обратиться")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Экстренные и дежурные службы")}</span><a className="card-action" href={lh("/berlin/srochnaya-pomoshch")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {mentalMatches && <article className="journey-card lilac" data-cat={themeOf("mental")}><div className="card-meta"><span>{tr(themeOf("mental"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Psychische Gesundheit</span> <small className="term-note">{tr("(психическое здоровье: где получить помощь)")}</small></h3><p>{tr("Кризисная помощь без звонка, психиатр, психотерапия, помощь близкому и пропуск встречи в Jobcenter.")}</p><div className="route-facts"><span>{tr("до 3 вопросов")}</span><span>{tr("Письменно, лично или по телефону")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные службы")}</span><a className="card-action" href={lh("/berlin/psihicheskoe-zdorovye")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {businessMatches && <article className="journey-card sand" data-cat={themeOf("business")}><div className="card-meta"><span>{tr(themeOf("business"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3>{tr("Gewerbe или Freiberuf")} <small className="term-note">{tr("(своё дело или фриланс)")}</small></h3><p>{tr("Проверить право на деятельность, определить способ регистрации и подать налоговую анкету.")}</p><div className="route-facts"><span>{tr("до 6 вопросов")}</span><span>{tr("Онлайн или лично")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные формы")}</span><a className="card-action" href={lh("/berlin/samostoyatelnaya-rabota")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {companyMatches && <article className="journey-card sand" data-cat={themeOf("company")}><div className="card-meta"><span>{tr(themeOf("company"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3>{tr("GmbH или UG")} <small className="term-note">{tr("(компания с ограниченной ответственностью)")}</small></h3><p>{tr("Выбрать форму, заверить договор у нотариуса, внести капитал, получить налоговый номер и не пропустить ежегодную отчётность.")}</p><div className="route-facts"><span>{tr("до 5 вопросов")}</span><span>{tr("Нотариус лично или по видео")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные формы")}</span><a className="card-action" href={lh("/berlin/gmbh-ug")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {notaryMatches && <article className="journey-card sand" data-cat={themeOf("notary")}><div className="card-meta"><span>{tr(themeOf("notary"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Notar</span> <small className="term-note">{tr("(нотариус: поиск и стоимость)")}</small></h3><p>{tr("Как найти нотариуса, почему цена одинакова у всех и сколько стоит учреждение GmbH или UG.")}</p><div className="route-facts"><span>{tr("до 3 вопросов")}</span><span>{tr("Лично или по видео")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные формы")}</span><a className="card-action" href={lh("/berlin/notar")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {socialnumberMatches && <article className="journey-card mint" data-cat={themeOf("socialnumber")}><div className="card-meta"><span>{tr(themeOf("socialnumber"))}</span><span className="scope-pill">{tr("Германия")}</span></div><h3><span lang="de">Sozialversicherungsnummer</span> <small className="term-note">{tr("(номер социального страхования и номер медстраховки)")}</small></h3><p>{tr("Где взять номер, который просит работодатель, как бесплатно получить документ с номером и где найти номер на карте eGK.")}</p><div className="route-facts"><span>{tr("до 2 вопросов")}</span><span>{tr("Бесплатно")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные формы")}</span><a className="card-action" href={lh("/berlin/sozialversicherungsnummer")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {settlementMatches && <article className="journey-card lilac" data-cat={themeOf("settlement")}><div className="card-meta"><span>{tr(themeOf("settlement"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Niederlassungserlaubnis</span> <small className="term-note">{tr("(бессрочный вид на жительство)")}</small></h3><p>{tr("Когда можно подавать: срок пребывания, немецкий, пенсионные взносы, документы и онлайн-заявление в LEA.")}</p><div className="route-facts"><span>{tr("до 4 вопросов")}</span><span>{tr("Онлайн и приём в LEA")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные формы")}</span><a className="card-action" href={lh("/berlin/niederlassungserlaubnis")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {bankMatches && <article className="journey-card mint" data-cat={themeOf("bank")}><div className="card-meta"><span>{tr(themeOf("bank"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Girokonto</span> <small className="term-note">{tr("(банковский счёт)")}</small></h3><p>{tr("Выбрать способ открытия счёта без визита или в отделении, подготовить документы и увидеть готовые банки.")}</p><div className="route-facts"><span>{tr("до 4 вопросов")}</span><span>{tr("Онлайн или в отделении")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Готовые банки из их официальных данных")}</span>{savedRoutes.bank && <div className="card-progress"><small>{savedRoutes.bank.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/bank")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {telecomMatches && <article className="journey-card lilac" data-cat={themeOf("telecom")}><div className="card-meta"><span>{tr(themeOf("telecom"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3>{tr("Mobilfunk и Internet")} <small className="term-note">{tr("(мобильная связь и интернет)")}</small></h3><p>{tr("Заключить договор, сменить провайдера, расторгнуть его или решить проблему по правилам для потребителей.")}</p><div className="route-facts"><span>{tr("до 2 вопросов")}</span><span>{tr("Онлайн или в магазине")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Права потребителя и официальные ссылки")}</span>{savedRoutes.telecom && <div className="card-progress"><small>{savedRoutes.telecom.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/svyaz")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {dogMatches && <article className="journey-card sand" data-cat={themeOf("dog")}><div className="card-meta"><span>{tr(themeOf("dog"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Hund</span> <small className="term-note">{tr("(собака: регистрация, налог, опасные породы)")}</small></h3><p>{tr("Зарегистрировать собаку, проверить налог и правила для списка пород.")}</p><div className="route-facts"><span>{tr("до 3 вопросов")}</span><span>{tr("Онлайн или письменно")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные формы Берлина")}</span>{savedRoutes.dog && <div className="card-progress"><small>{savedRoutes.dog.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/sobaka/marshrut")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {wbsMatches && <article className="journey-card sand" data-cat={themeOf("wbs")}><div className="card-meta"><span>{tr(themeOf("wbs"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">WBS</span> <small className="term-note">{tr("(разрешение на социальное жильё)")}</small></h3><p>{tr("Проверить, можно ли подать заявление, подготовить документы и выбрать способ подачи: онлайн, почтой или лично.")}</p><div className="route-facts"><span>{tr("до 3 вопросов")}</span><span>{tr("Онлайн, почтой или лично")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы Берлина")}</span>{savedRoutes.wbs && <div className="card-progress"><small>{savedRoutes.wbs.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/wbs")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {kindergeldMatches && <article className="journey-card mint" data-cat={themeOf("kindergeld")}><div className="card-meta"><span>{tr(themeOf("kindergeld"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Kindergeld</span> <small className="term-note">{tr("(пособие на ребёнка)")}</small></h3><p>{tr("Проверить, можно ли подать заявление, выбрать способ подачи и узнать, что делать, если ответа нет.")}</p><div className="route-facts"><span>{tr("до 3 вопросов")}</span><span>{tr("Онлайн, с подписью или по почте")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы Bundesagentur für Arbeit")}</span>{savedRoutes.kindergeld && <div className="card-progress"><small>{savedRoutes.kindergeld.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/kindergeld")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {jobcenterMatches && <article className="journey-card sand" data-cat={themeOf("jobcenter")}><div className="card-meta"><span>{tr(themeOf("jobcenter"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3>{tr("Agentur für Arbeit и Jobcenter")} <small className="term-note">{tr("(потеря работы и пособия)")}</small></h3><p>{tr("Зарегистрироваться безработным, подать заявление на Arbeitslosengeld или на Grundsicherung.")}</p><div className="route-facts"><span>{tr("до 3 вопросов")}</span><span>{tr("Онлайн или лично")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы Bundesagentur für Arbeit")}</span>{savedRoutes.jobcenter && <div className="card-progress"><small>{savedRoutes.jobcenter.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/jobcenter")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {kitaMatches && <article className="journey-card mint" data-cat={themeOf("kita")}><div className="card-meta"><span>{tr(themeOf("kita"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3>Kita, Schule und Geburt <small className="term-note">{tr("(детский сад, школа, рождение ребёнка)")}</small></h3><p>{tr("Получить Kita-Gutschein, записать ребёнка в школу или сообщить о рождении в Standesamt.")}</p><div className="route-facts"><span>{tr("до 3 вопросов")}</span><span>{tr("Почтой или лично")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы Берлина")}</span>{savedRoutes.kita && <div className="card-progress"><small>{savedRoutes.kita.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/kita-schule")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {employmentMatches && <article className="journey-card sand" data-cat={themeOf("employment")}><div className="card-meta"><span>{tr(themeOf("employment"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Stellensuche</span> <small className="term-note">{tr("(поиск работы по найму)")}</small></h3><p>{tr("Понять, можно ли работать по найму, где искать вакансии и куда сообщить о нарушении.")}</p><div className="route-facts"><span>{tr("до 3 вопросов")}</span><span>{tr("Онлайн или по телефону")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Bundesagentur für Arbeit, Zoll и Берлин")}</span>{savedRoutes.employment && <div className="card-progress"><small>{savedRoutes.employment.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/rabota-po-najmu")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {elterngeldMatches && <article className="journey-card mint" data-cat={themeOf("elterngeld")}><div className="card-meta"><span>{tr(themeOf("elterngeld"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Elterngeld</span> <small className="term-note">{tr("(пособие родителям после рождения ребёнка)")}</small></h3><p>{tr("Проверить право, подготовить документы и подать заявление в Elterngeldstelle.")}</p><div className="route-facts"><span>{tr("до 7 вопросов")}</span><span>{tr("По почте")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы Берлина и Familienportal")}</span>{savedRoutes.elterngeld && <div className="card-progress"><small>{savedRoutes.elterngeld.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/elterngeld")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {kinderzuschlagMatches && <article className="journey-card mint" data-cat={themeOf("kinderzuschlag")}><div className="card-meta"><span>{tr(themeOf("kinderzuschlag"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Kinderzuschlag</span> <small className="term-note">{tr("(доплата к Kindergeld для семей с небольшим доходом)")}</small></h3><p>{tr("Проверить условия и подать заявление в Familienkasse.")}</p><div className="route-facts"><span>{tr("до 4 вопросов")}</span><span>{tr("Онлайн, по почте или лично")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы Bundesagentur für Arbeit")}</span>{savedRoutes.kinderzuschlag && <div className="card-progress"><small>{savedRoutes.kinderzuschlag.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/kinderzuschlag")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {taxFilingMatches && <article className="journey-card sand" data-cat={themeOf("steuererklaerung")}><div className="card-meta"><span>{tr(themeOf("steuererklaerung"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Einkommensteuererklärung</span> <small className="term-note">{tr("(налоговая декларация)")}</small></h3><p>{tr("Понять, нужно ли подавать, к какому сроку и как: ELSTER, бумага или консультант.")}</p><div className="route-facts"><span>{tr("до 4 вопросов")}</span><span>{tr("Онлайн, на бумаге или через консультанта")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы Берлина и ELSTER")}</span>{savedRoutes.steuererklaerung && <div className="card-progress"><small>{savedRoutes.steuererklaerung.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/steuererklaerung")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {elternzeitMatches && <article className="journey-card mint" data-cat={themeOf("elternzeit")}><div className="card-meta"><span>{tr(themeOf("elternzeit"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Elternzeit</span> <small className="term-note">{tr("(родительский отпуск)")}</small></h3><p>{tr("Как уведомить работодателя, на сколько и что с неполным днём, защитой от увольнения и страховкой.")}</p><div className="route-facts"><span>{tr("до 5 вопросов")}</span><span>{tr("Письменно работодателю")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("BMBFSFJ, Familienportal и закон BEEG")}</span>{savedRoutes.elternzeit && <div className="card-progress"><small>{savedRoutes.elternzeit.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/elternzeit")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {wohngeldMatches && <article className="journey-card sand" data-cat={themeOf("wohngeld")}><div className="card-meta"><span>{tr(themeOf("wohngeld"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Wohngeld</span> <small className="term-note">{tr("(жилищная доплата к аренде или расходам на жильё)")}</small></h3><p>{tr("Проверить право и подать заявление онлайн или на бумаге в Wohnungsamt.")}</p><div className="route-facts"><span>{tr("до 5 вопросов")}</span><span>{tr("Онлайн или на бумаге")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы Берлина, WoGG и BMWSB")}</span>{savedRoutes.wohngeld && <div className="card-progress"><small>{savedRoutes.wohngeld.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/wohngeld")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {mutterschutzMatches && <article className="journey-card mint" data-cat={themeOf("mutterschutz")}><div className="card-meta"><span>{tr(themeOf("mutterschutz"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Mutterschutz und Mutterschaftsgeld</span> <small className="term-note">{tr("(защита материнства и пособие по материнству)")}</small></h3><p>{tr("Узнать, что положено до и после родов, и куда подать заявление на Mutterschaftsgeld.")}</p><div className="route-facts"><span>{tr("до 4 вопросов")}</span><span>{tr("Заявление в кассу или BAS")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы Familienportal и BAS")}</span>{savedRoutes.mutterschutz && <div className="card-progress"><small>{savedRoutes.mutterschutz.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/mutterschutz")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {bildungspaketMatches && <article className="journey-card sand" data-cat={themeOf("bildungspaket")}><div className="card-meta"><span>{tr(themeOf("bildungspaket"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Bildungs- und Teilhabepaket</span> <small className="term-note">{tr("(помощь на школу и досуг детей)")}</small></h3><p>{tr("Проверить право и получить berlinpass-BuT для школы, Kita и досуга.")}</p><div className="route-facts"><span>{tr("до 3 вопросов")}</span><span>berlinpass-BuT</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы Берлина и Bundesagentur")}</span>{savedRoutes.bildungspaket && <div className="card-progress"><small>{savedRoutes.bildungspaket.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/bildungspaket")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {pflegegeldMatches && <article className="journey-card mint" data-cat={themeOf("pflegegeld")}><div className="card-meta"><span>{tr(themeOf("pflegegeld"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Pflegegeld und Pflegegrad</span> <small className="term-note">{tr("(пособие по уходу и степень нуждаемости в уходе)")}</small></h3><p>{tr("Узнать, как получить Pflegegrad и Pflegegeld и куда подать заявление.")}</p><div className="route-facts"><span>{tr("до 5 вопросов")}</span><span>{tr("Звонок или письмо в Pflegekasse")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: BMG, Medizinischer Dienst и Берлин")}</span>{savedRoutes.pflegegeld && <div className="card-progress"><small>{savedRoutes.pflegegeld.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/pflegegeld")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {schwerbehinderungMatches && <article className="journey-card sand" data-cat={themeOf("schwerbehinderung")}><div className="card-meta"><span>{tr(themeOf("schwerbehinderung"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Schwerbehindertenausweis</span> <small className="term-note">{tr("(удостоверение тяжёлой инвалидности)")}</small></h3><p>{tr("Подать заявление в Versorgungsamt, догрузить документы или понять решение с GdB.")}</p><div className="route-facts"><span>{tr("до 3 вопросов")}</span><span>{tr("Бумажное заявление по почте")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: LAGeSo и Bundesagentur für Arbeit")}</span>{savedRoutes.schwerbehinderung && <div className="card-progress"><small>{savedRoutes.schwerbehinderung.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/schwerbehinderung")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {wohnungsgeberMatches && <article className="journey-card mint" data-cat={themeOf("wohnungsgeber")}><div className="card-meta"><span>{tr(themeOf("wohnungsgeber"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Wohnungsgeberbestätigung</span> <small className="term-note">{tr("(подтверждение заселения от арендодателя)")}</small></h3><p>{tr("Получить или выдать подтверждение заселения, нужное для регистрации адреса.")}</p><div className="route-facts"><span>{tr("до 3 вопросов")}</span><span>{tr("Письмо арендодателю")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Берлин и закон о регистрации")}</span>{savedRoutes.wohnungsgeber && <div className="card-progress"><small>{savedRoutes.wohnungsgeber.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/wohnungsgeber")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {umzugMatches && <article className="journey-card sand" data-cat={themeOf("umzug")}><div className="card-meta"><span>{tr(themeOf("umzug"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Umzug</span> <small className="term-note">{tr("(переезд и смена адреса)")}</small></h3><p>{tr("Сменить адрес, обновить документы и сообщить о переезде.")}</p><div className="route-facts"><span>{tr("до 4 вопросов")}</span><span>{tr("Онлайн или в Bürgeramt")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Берлин и Rundfunkbeitrag")}</span>{savedRoutes.umzug && <div className="card-progress"><small>{savedRoutes.umzug.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/umzug")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {arbeitslosengeldMatches && <article className="journey-card mint" data-cat={themeOf("arbeitslosengeld")}><div className="card-meta"><span>{tr(themeOf("arbeitslosengeld"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Arbeitslosengeld</span> <small className="term-note">{tr("(пособие по безработице)")}</small></h3><p>{tr("Проверить право, размер и срок Arbeitslosengeld и избежать блокировки.")}</p><div className="route-facts"><span>{tr("до 5 вопросов")}</span><span>{tr("Онлайн или лично в Agentur")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Bundesagentur für Arbeit")}</span>{savedRoutes.arbeitslosengeld && <div className="card-progress"><small>{savedRoutes.arbeitslosengeld.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/arbeitslosengeld")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {grundsicherungsgeldMatches && <article className="journey-card sand" data-cat={themeOf("grundsicherungsgeld")}><div className="card-meta"><span>{tr(themeOf("grundsicherungsgeld"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Grundsicherungsgeld</span> <small className="term-note">{tr("(бывшее Bürgergeld: основное пособие для нуждающихся)")}</small></h3><p>{tr("Узнать, сколько положено, и подать заявление в Jobcenter.")}</p><div className="route-facts"><span>{tr("до 6 вопросов")}</span><span>{tr("Онлайн или на бумаге в Jobcenter")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Bundesagentur и Bundesregierung")}</span>{savedRoutes.grundsicherungsgeld && <div className="card-progress"><small>{savedRoutes.grundsicherungsgeld.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/grundsicherungsgeld")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {kfzMatches && <article className="journey-card mint" data-cat={themeOf("kfz")}><div className="card-meta"><span>{tr(themeOf("kfz"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Kfz-Ummeldung</span> <small className="term-note">{tr("(перерегистрация автомобиля после переезда)")}</small></h3><p>{tr("Перерегистрировать машину или внести новый адрес в документ.")}</p><div className="route-facts"><span>{tr("до 6 вопросов")}</span><span>{tr("Запись в Kfz-Zulassungsbehörde или онлайн")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Берлин (LABO)")}</span>{savedRoutes.kfz && <div className="card-progress"><small>{savedRoutes.kfz.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/kfz-ummeldung")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {einbuergerungMatches && <article className="journey-card sand" data-cat={themeOf("einbuergerung")}><div className="card-meta"><span>{tr(themeOf("einbuergerung"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Einbürgerung</span> <small className="term-note">{tr("(получение гражданства Германии)")}</small></h3><p>{tr("Проверить условия и подать онлайн-заявление на гражданство.")}</p><div className="route-facts"><span>{tr("до 7 вопросов")}</span><span>{tr("Онлайн-заявление в Landesamt für Einwanderung")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Берлин и Willkommenszentrum")}</span>{savedRoutes.einbuergerung && <div className="card-progress"><small>{savedRoutes.einbuergerung.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/einbuergerung")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {workpermitMatches && <article className="journey-card mint" data-cat={themeOf("workpermit")}><div className="card-meta"><span>{tr(themeOf("workpermit"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Aufenthaltstitel für Beschäftigung</span> <small className="term-note">{tr("(вид на жительство для работы: Blue Card и Fachkräfte)")}</small></h3><p>{tr("Понять, какой путь подходит: Blue Card, специалист или Chancenkarte.")}</p><div className="route-facts"><span>{tr("до 10 вопросов")}</span><span>{tr("Онлайн-заявление в Landesamt für Einwanderung")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Берлин и Make it in Germany")}</span>{savedRoutes.workpermit && <div className="card-progress"><small>{savedRoutes.workpermit.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/aufenthalt-rabota")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {recognitionMatches && <article className="journey-card mint" data-cat={themeOf("recognition")}><div className="card-meta"><span>{tr(themeOf("recognition"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Anerkennung</span> <small className="term-note">{tr("(признание иностранного диплома или профессии)")}</small></h3><p>{tr("Найти ведомство для вашей профессии и подать на признание.")}</p><div className="route-facts"><span>{tr("до 10 вопросов")}</span><span>{tr("Заявление в профильное ведомство")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Anerkennung in Deutschland и Берлин")}</span>{savedRoutes.recognition && <div className="card-progress"><small>{savedRoutes.recognition.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/anerkennung")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {languageMatches && <article className="journey-card mint" data-cat={themeOf("language")}><div className="card-meta"><span>{tr(themeOf("language"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Integrationskurs</span> <small className="term-note">{tr("(интеграционный и языковой курс)")}</small></h3><p>{tr("Получить допуск к курсу, записаться и узнать, сколько он стоит.")}</p><div className="route-facts"><span>{tr("до 10 вопросов")}</span><span>{tr("Допуск BAMF и запись у организатора")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: BAMF и BMI")}</span>{savedRoutes.language && <div className="card-progress"><small>{savedRoutes.language.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/integrationskurs")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {reunionMatches && <article className="journey-card mint" data-cat={themeOf("reunion")}><div className="card-meta"><span>{tr(themeOf("reunion"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Familiennachzug</span> <small className="term-note">{tr("(воссоединение семьи)")}</small></h3><p>{tr("Вид на жительство для супруга или ребёнка: виза, условия, документы.")}</p><div className="route-facts"><span>{tr("до 9 вопросов")}</span><span>{tr("Онлайн-заявление в Landesamt für Einwanderung")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Берлин, Make it in Germany и BAMF")}</span>{savedRoutes.reunion && <div className="card-progress"><small>{savedRoutes.reunion.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/familiennachzug")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {sprachkursMatches && <article className="journey-card lilac" data-cat={themeOf("sprachkurs")}><div className="card-meta"><span>{tr(themeOf("sprachkurs"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Sprachkurs</span> <small className="term-note">{tr("(языковые курсы)")}</small></h3><p>{tr("Выбрать язык для изучения и язык объяснений, найти курс vhs, Goethe-Institut или государственный Integrationskurs.")}</p><div className="route-facts"><span>{tr("до 5 вопросов")}</span><span>{tr("Выбор курса")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: vhs Берлина, BAMF, Arbeitsagentur и Goethe-Institut")}</span>{savedRoutes.sprachkurs && <div className="card-progress"><small>{savedRoutes.sprachkurs.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/sprachkurs")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {studyMatches && <article className="journey-card mint" data-cat={themeOf("study")}><div className="card-meta"><span>{tr(themeOf("study"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3>{tr("Университет, Studienkolleg и Ausbildung")}</h3><p>{tr("Выбрать, куда поступать и на каком языке учиться: документы, каталоги программ и шаги.")}</p><div className="route-facts"><span>{tr("до 5 вопросов")}</span><span>{tr("Выбор языка обучения")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: uni-assist, DAAD, HWR Berlin и Arbeitsagentur")}</span>{savedRoutes.study && <div className="card-progress"><small>{savedRoutes.study.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/studium-ausbildung")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {petmoveMatches && <article className="journey-card sand" data-cat={themeOf("petmove")}><div className="card-meta"><span>{tr(themeOf("petmove"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3>{tr("Переезд с животным")} <small className="term-note">{tr("(собака, кошка, хорёк, птица)")}</small></h3><p>{tr("Чип, прививка, тест на антитела, сертификат и пункт ввоза; затем первые шаги в Берлине.")}</p><div className="route-facts"><span>{tr("до 4 вопросов")}</span><span>{tr("Из ЕС и из стран вне ЕС")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Европейская комиссия, BMLEH и таможня")}</span>{savedRoutes.petmove && <div className="card-progress"><small>{savedRoutes.petmove.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/pereezd-s-zhivotnym")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {petpassMatches && <article className="journey-card mint" data-cat={themeOf("petpass")}><div className="card-meta"><span>{tr(themeOf("petpass"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">EU-Heimtierausweis</span> <small className="term-note">{tr("(паспорт животного ЕС)")}</small></h3><p>{tr("Кто выдаёт паспорт, что сделать до него и действует ли паспорт другой страны ЕС.")}</p><div className="route-facts"><span>{tr("до 4 вопросов")}</span><span>{tr("Приём у ветеринара")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: BMLEH и Европейская комиссия")}</span>{savedRoutes.petpass && <div className="card-progress"><small>{savedRoutes.petpass.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/heimtierausweis")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {vetMatches && <article className="journey-card lilac" data-cat={themeOf("vet")}><div className="card-meta"><span>{tr(themeOf("vet"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Tierarzt</span> <small className="term-note">{tr("(ветеринар в Берлине)")}</small></h3><p>{tr("Дежурные клиники ночью и в выходные, тариф и практики, где говорят на вашем языке.")}</p><div className="route-facts"><span>{tr("до 2 вопросов")}</span><span>{tr("Выбор языка приёма")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Список ветеринарной палаты Берлина и сайты практик")}</span>{savedRoutes.vet && <div className="card-progress"><small>{savedRoutes.vet.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/veterinar")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {dogtrainerMatches && <article className="journey-card sand" data-cat={themeOf("dogtrainer")}><div className="card-meta"><span>{tr(themeOf("dogtrainer"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3><span lang="de">Hundeschule und Hundeführerschein</span> <small className="term-note">{tr("(дрессировка и экзамен владельца собаки)")}</small></h3><p>{tr("Дрессировщик с разрешением ведомства, экзамен, чтобы гулять без поводка, и Wesenstest.")}</p><div className="route-facts"><span>{tr("до 3 вопросов")}</span><span>{tr("Признанные эксперты Сената")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы Сената Берлина")}</span>{savedRoutes.dogtrainer && <div className="card-progress"><small>{savedRoutes.dogtrainer.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/dressirovka")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {transportMatches && <article className="journey-card blue" data-cat={themeOf("transport")}><div className="card-meta"><span>{tr(themeOf("transport"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3>{tr("Билеты на транспорт Берлина и Deutschlandticket")}</h3><p>{tr("Сравнить билеты VBB онлайн и в точках продаж, Deutschlandticket, Berlin-Ticket S и бесплатные или субсидированные билеты для подходящих групп.")}</p><div className="route-facts"><span>{tr("до 4 вопросов")}</span><span>{tr("Онлайн и лично")}</span></div><span className="route-ready-label"><CheckIcon /> {tr("Тарифы и способы покупки VBB")}</span>{savedRoutes.transport && <div className="card-progress"><small>{savedRoutes.transport.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/transport-tickets")}>{savedRoutes.transport ? tr("Продолжить") : tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {cultureMatches && <article className="journey-card coral" data-cat={themeOf("culture")}><div className="card-meta"><span>{tr(themeOf("culture"))}</span><span className="scope-pill">{tr("Берлин")}</span></div><h3>{tr("Бесплатные музеи, события и льготы")}</h3><p>{tr("Найти предложения для детей, семей, студентов, людей с инвалидностью, получателей пособий, беженцев и людей с низким доходом.")}</p><div className="route-facts"><span>{tr("до 3 вопросов")}</span><span>{tr("Онлайн и на площадке")}</span></div><span className="route-ready-label"><CheckIcon /> {tr("Официальные культурные предложения Берлина")}</span>{savedRoutes.culture && <div className="card-progress"><small>{savedRoutes.culture.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/culture-discounts")}>{savedRoutes.culture ? tr("Продолжить") : tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {relocationMatches && <article className="journey-card sand" data-cat={themeOf("relocation")}><div className="card-meta"><span>{tr(themeOf("relocation"))}</span><span className="scope-pill">{tr("Германия")}</span></div><h3>{tr("Переезд в Германию")} <small className="term-note">{tr("(какой путь вам подходит)")}</small></h3><p>{tr("Понять, нужна ли виза и какой путь подходит: работа, учёба, Ausbildung, волонтёрство, семья или Working Holiday.")}</p><div className="route-facts"><span>{tr("до 3 вопросов")}</span><span>{tr("Без визы для ряда стран")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Auswärtiges Amt и Make it in Germany")}</span>{savedRoutes.relocation && <div className="card-progress"><small>{savedRoutes.relocation.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/pereezd-v-germaniyu")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {chancenkarteMatches && <article className="journey-card mint" data-cat={themeOf("chancenkarte")}><div className="card-meta"><span>{tr(themeOf("chancenkarte"))}</span><span className="scope-pill">{tr("Германия")}</span></div><h3><span lang="de">Chancenkarte</span> <small className="term-note">{tr("(карта возможностей для поиска работы)")}</small></h3><p>{tr("Посчитать баллы, подготовить средства и документы и подать на визу ещё в своей стране.")}</p><div className="route-facts"><span>{tr("до 9 вопросов")}</span><span>{tr("Расчёт баллов по официальной таблице")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Make it in Germany и Auswärtiges Amt")}</span>{savedRoutes.chancenkarte && <div className="card-progress"><small>{savedRoutes.chancenkarte.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/chancenkarte")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {workvisaMatches && <article className="journey-card mint" data-cat={themeOf("workvisa")}><div className="card-meta"><span>{tr(themeOf("workvisa"))}</span><span className="scope-pill">{tr("Германия")}</span></div><h3>{tr("Виза для работы")} <small className="term-note">{tr("(Blue Card, специалисты, Anerkennungspartnerschaft)")}</small></h3><p>{tr("Выбрать вид визы по образованию и зарплате, получить согласие Bundesagentur für Arbeit и подать до переезда.")}</p><div className="route-facts"><span>{tr("до 6 вопросов")}</span><span>{tr("Онлайн через Auslandsportal")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Auswärtiges Amt и Bundesagentur für Arbeit")}</span>{savedRoutes.workvisa && <div className="card-progress"><small>{savedRoutes.workvisa.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/viza-rabota")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {volunteerMatches && <article className="journey-card lilac" data-cat={themeOf("volunteer")}><div className="card-meta"><span>{tr(themeOf("volunteer"))}</span><span className="scope-pill">{tr("Германия")}</span></div><h3>{tr("Виза для волонтёров")} <small className="term-note">{tr("(BFD, FSJ, FÖJ, Европейский корпус солидарности)")}</small></h3><p>{tr("Найти место службы, проверить условия по возрасту и подготовить документы для визы.")}</p><div className="route-facts"><span>{tr("до 4 вопросов")}</span><span>{tr("Карманные деньги и страховка от места службы")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Bundesfreiwilligendienst и Берлин")}</span>{savedRoutes.volunteer && <div className="card-progress"><small>{savedRoutes.volunteer.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/viza-volontyor")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {studyvisaMatches && <article className="journey-card mint" data-cat={themeOf("studyvisa")}><div className="card-meta"><span>{tr(themeOf("studyvisa"))}</span><span className="scope-pill">{tr("Германия")}</span></div><h3>{tr("Виза для учёбы и Ausbildung")}</h3><p>{tr("Посчитать средства на 2026 год, открыть Sperrkonto и подать на визу для учёбы, поступления или Ausbildung.")}</p><div className="route-facts"><span>{tr("до 5 вопросов")}</span><span>{tr("Средства на 2026 год")}</span></div><span className="route-ready-label"><CheckIcon />  {tr("Официальные страницы: Make it in Germany и Берлин")}</span>{savedRoutes.studyvisa && <div className="card-progress"><small>{savedRoutes.studyvisa.outcome === "received" ? tr("Результат получен") : tr("Ответы сохранены")}</small></div>}<a className="card-action" href={lh("/berlin/viza-uchyoba")}>{tr("Начать маршрут")} <ArrowIcon /></a></article>}
          {matchingCount === 0 && <div className="empty-state"><span>{tr("0 подходящих маршрутов")}</span><h3>{query.trim() ? tr("Этого маршрута пока нет в NOSTRES") : tr("Попробуйте изменить фильтры")}</h3><p>{query.trim() ? tr("Сейчас доступны маршруты по документам, жилью, здоровью, семье, работе, пособиям, налогам, банку и связи, учёбе, транспорту, культурным льготам и животным.") : tr("Выберите другую категорию или очистите фильтры.")}</p><button type="button" onClick={resetFilters}>{tr("Показать маршруты")}</button></div>}
        </GroupedGrid>
      </section>

      <section className="test-invite" aria-labelledby="test-invite-title">
        <div><p className="overline">{tr("Следующий этап")}</p><h2 id="test-invite-title">{tr("Проверьте NOSTRES на реальной задаче")}</h2><p>{tr("Выберите один маршрут, попробуйте дойти до официального действия и оставьте короткую анонимную оценку. На тест достаточно 10–15 минут.")}</p></div>
        <a className="primary-action" href={lh("/mvp-test")}>{tr("Открыть сценарий тестирования")} <ArrowIcon /></a>
      </section>

      <section className="trust-band" aria-label={tr("Принципы NOSTRES")}>
        <div><strong>{tr("Только официально")}</strong><span>{tr("Требования, сроки и действия подтверждаются первоисточником.")}</span></div>
        <div><strong>{tr("Берлин ≠ Германия")}</strong><span>{tr("Федеральные правила и городские действия отмечены отдельно.")}</span></div>
        <div><strong>{tr("Проверено")} {tr(checkedAt)}</strong><span>{tr("Дата сверки видна рядом с каждым набором источников.")}</span></div>
        <div><strong>{tr("Прогресс остаётся")}</strong><span>{tr("Ответы и чек-листы сохраняются только на вашем устройстве.")}</span></div>
      </section>

      <section className="section sources" id="sources">
        <div className="section-heading compact-heading">
          <div><p className="overline">{tr("Официальный каталог")}</p><h2>{tr("Куда ведёт NOSTRES")}</h2></div>
          <p>{tr("Каждая ссылка ведёт на официальную страницу услуги, форму или государственный справочник.")}</p>
        </div>
        <div className="source-directory">
          <a href="https://www.berlin.de/einwanderung/termine/unsere-dienstleistungen/artikel.873508.php" target="_blank" rel="noreferrer"><span><b>{tr("Берлинское ведомство по делам иностранцев")}</b><small>{tr("Каталог услуг, онлайн-заявления и контакты подразделений")}</small></span><ExternalIcon /></a>
          <a href="https://gesund.bund.de/suchen/aerztinnen-und-aerzte" target="_blank" rel="noreferrer"><span><b>{tr("Федеральный поиск врачебных практик")}</b><small>{tr("Врачи, адреса, специальности и языки")}</small></span><ExternalIcon /></a>
          <a href="https://service.berlin.de/dienstleistung/121921/" target="_blank" rel="noreferrer"><span><b>ServicePortal Berlin: Gewerbe</b><small>{tr("Условия, онлайн-форма, районные ведомства и сборы")}</small></span><ExternalIcon /></a>
          {trDeep(sourceDirectory).map((source) => (
            <a href={lh(source.url)} target="_blank" rel="noreferrer" key={source.name}>
              
              <span><b>{source.name}</b><small>{source.purpose}</small></span>
              <ExternalIcon />
            </a>
          ))}
        </div>
        <div className="editorial-rule">
          <span className="rule-mark">N</span>
          <div><b>{tr("Правило редакции NOSTRES")}</b><p>{tr("Если практический вывод нельзя связать с официальным источником, он не публикуется как рекомендация. NOSTRES помогает найти порядок действий; юридические, налоговые и медицинские решения вы принимаете самостоятельно.")}</p></div>
        </div>
      </section>

      <section className="help-section" id="help">
        <div className="help-inner">
          <div className="help-copy">
            <p className="overline">{tr("Если возникла проблема")}</p>
            <h2>{tr("Не оставайтесь в тупике") === "Не оставайтесь в тупике" ? <><span className="help-title-first-line">Не оставайтесь</span><br />в тупике</> : tr("Не оставайтесь в тупике")}</h2>
            <p>{tr("NOSTRES не отправляет к платному посреднику. В каждом маршруте есть официальный запасной путь: другой допустимый способ, контакт ведомства или бесплатная государственная навигация.")}</p>
            <a className="primary-action inline-action" href="https://service.berlin.de/terminvereinbarung/" target="_blank" rel="noreferrer">{tr("Правила записи в Берлине")} <ExternalIcon /></a>
          </div>
          <div className="help-categories">
            <a href="https://service.berlin.de/terminvereinbarung/" target="_blank" rel="noreferrer"><span>01</span><b>{tr("Нет свободной записи")}</b><small>{tr("Официальные правила, дополнительные термины и номер 115")}</small></a>
            <a href="https://service.berlin.de/nutzerkonten/bundid/" target="_blank" rel="noreferrer"><span>02</span><b>{tr("Нет BundID (федеральной учётной записи)")}</b><small>{tr("Официальные способы регистрации и входа")}</small></a>
            <a href="https://service.berlin.de/dienstleistung/329833/" target="_blank" rel="noreferrer"><span>03</span><b>{tr("Не работает eID (электронная идентификация) или PIN (личный код)")}</b><small>{tr("Настройка и восстановление")}</small></a>
            <a href="https://service.berlin.de/dienstleistung/120686/" target="_blank" rel="noreferrer"><span>04</span><b>{tr("Нужны формы и адреса")}</b><small>{tr("Документы и все районные ведомства (Bürgeramt) на странице официальной услуги")}</small></a>
          </div>
        </div>
      </section>


      <footer className="site-footer">
        <a className="brand footer-brand" href="#top"><span className="brand-mark">N</span><span className="brand-copy"><b>NOSTRES</b><small>{tr("Понятный путь")}</small></span></a>
        <p>{tr("Понятный путь после переезда · первый город Берлин")}</p>
        <p>{tr("Информация не является индивидуальной юридической, медицинской или налоговой консультацией.")}</p>
        <nav aria-label={tr("Информация о проекте")} className="footer-links">
          <ShareButton variant="link" />
          <InstallButton variant="link" />
          <a href={lh("/contact")}>{tr("Контакты")}</a>
          <a href={lh("/privacy")}>{tr("Конфиденциальность")}</a>
          <a href={lh("/about")}>{tr("О проекте")}</a>
          <span className="app-version">{APP_VERSION}</span>
        </nav>
      </footer>

      <div className="prototype-note"><span>{tr("Пилотный запуск")}</span><p>{tr("Пятьдесят три самостоятельных маршрута доступны сейчас. Ответы на вопросы сохраняются на вашем устройстве; документы, Steuer-ID и медицинские сведения не запрашиваются. Платных специалистов в первой версии нет.")}</p></div>

      {viewJourney && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedJourney(null); }}>
          <aside ref={dialogRef} className="detail-panel" role="dialog" aria-modal="true" aria-label={viewJourney.title} tabIndex={-1}>
            <button className="close-button" type="button" onClick={() => setSelectedJourney(null)} aria-label={tr("Закрыть")}>×</button>
            <div className="panel-meta"><span>{viewJourney.category}</span><span>{viewJourney.scope}</span></div>
            <h2><ExplainedText text={viewJourney.title} /></h2>
            <p className="panel-lede">{viewJourney.summary}</p>
            <div className="applies-box"><b>{tr("Подходит, если")}</b><p>{viewJourney.applies}</p></div>

            <section className="panel-section questionnaire">
              <div className="panel-section-title"><h3>{tr("Ваша ситуация")}</h3><span>{visibleQuestions.filter((question) => answers[question.id]).length}/{visibleQuestions.length}</span></div>
              {visibleQuestions.map((question, questionIndex) => (
                <fieldset className="route-question" key={question.id}>
                  <legend><span>{questionIndex + 1}</span>{question.prompt}</legend>
                  {question.hint && <p>{question.hint}</p>}
                  {question.guide && <div className="question-guide"><strong>{question.guide.title}</strong><p>{question.guide.intro}</p><ul>{question.guide.items.map((item) => <li key={item}>{item}</li>)}</ul><div>{question.guide.links.map((link) => <a href={lh(link.url)} target="_blank" rel="noreferrer" key={link.url}>{link.label}<ExternalIcon /></a>)}</div></div>}
                  <div className="option-grid">
                    {question.options.map((option) => (
                      <label className={answers[question.id] === option.value ? "selected" : ""} key={option.value}>
                        <input type="radio" name={question.id} value={option.value} checked={answers[question.id] === option.value} onChange={() => answerQuestion(question.id, option.value)} />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </section>

            {personalizedResult ? (
              <section className="personal-result" aria-live="polite">
                <span className="result-kicker"><CheckIcon />  {tr("Ваш персональный результат")}</span>
                <h3>{personalizedResult.title}</h3>
                <p>{personalizedResult.text}</p>
                {personalizedResult.warning && <div className="result-warning">{personalizedResult.warning}</div>}
                <a className="primary-action full-action" href={lh(personalizedResult.actionUrl)} target="_blank" rel="noreferrer">{personalizedResult.actionLabel} <ExternalIcon /></a>
              </section>
            ) : <div className="result-placeholder">{tr("Ответьте на все вопросы — NOSTRES выберет применимый следующий шаг.")}</div>}

            {viewJourney.actionMethods && personalizedResult && (
              <section className="panel-section method-section" id="method-choice">
                <div className="panel-section-title"><h3>{availableMethods.length > 1 ? tr("Выберите способ") : tr("Доступный способ")}</h3><span>{availableMethods.length}</span></div>
                <div className="method-grid">
                  {availableMethods.map((method) => (
                    <button className={selectedMethodId === method.id ? "method-card selected" : "method-card"} type="button" aria-pressed={selectedMethodId === method.id} key={method.id} onClick={() => chooseMethod(method.id)}>
                      <span className="method-card-top"><b>{method.type === "online" ? tr("Онлайн") : method.type === "hybrid" ? tr("Комбинированно") : tr("Лично")}</b><small>{method.badge}</small></span>
                      <strong>{method.title}</strong>
                      <p>{method.summary}</p>
                      <span className={`availability ${method.availability}`}>{method.availabilityLabel}</span>
                    </button>
                  ))}
                </div>
                {availableMethods.length === 1 && <p className="method-note">{tr("Другой способ не показан, потому что он не подтверждён официальными условиями для ваших ответов.")}</p>}
              </section>
            )}

            {selectedMethod && (
              <>
                <section className="panel-section"><h3>{tr("Что должно быть готово")}</h3><ul className="requirement-list">{selectedMethod.prerequisites.map((item) => <li key={item}><CheckIcon /><span>{item}</span></li>)}</ul></section>
                <section className="panel-section"><h3>{tr("Документы и данные")}</h3><div className="document-list">{selectedMethod.documents.map((item) => <span key={item}>{item}</span>)}</div></section>
                <section className="panel-section"><div className="panel-section-title"><h3>{tr("Этапы выполнения")}</h3><span>{doneSteps.length}/{activeSteps.length}</span></div><ol className="steps-list interactive-steps">{activeSteps.map((item, index) => <li className={doneSteps.includes(index) ? "done" : ""} key={item}><button type="button" aria-pressed={doneSteps.includes(index)} onClick={() => toggleStep(index)} aria-label={doneSteps.includes(index) ? tr("Отметить шаг невыполненным") : tr("Отметить шаг выполненным")}>{doneSteps.includes(index) ? <CheckIcon /> : index + 1}</button><p>{item}</p></li>)}</ol><small className="local-save-note">{tr("Ответы, выбранный способ и отметки сохраняются только на этом устройстве.")}</small></section>

                <section className="method-detail" aria-live="polite">
                  <div className="method-detail-heading"><span>{selectedMethod.type === "online" ? tr("Онлайн") : selectedMethod.type === "hybrid" ? tr("Комбинированно") : tr("Личное посещение")}</span><h3>{selectedMethod.title}</h3><p>{selectedMethod.summary}</p></div>
                  <div className="timeline-grid">
                    <div><small>{tr("Подать")}</small><b>{selectedMethod.deadline}</b></div>
                    <div><small>{tr("Подготовка")}</small><b>{selectedMethod.preparationTime}</b></div>
                    <div><small>{tr("Запись")}</small><b>{selectedMethod.appointmentTime}</b></div>
                    <div><small>{tr("Исполнение")}</small><b>{selectedMethod.processingTime}</b></div>
                    <div><small>{tr("Стоимость")}</small><b>{selectedMethod.fee}</b></div>
                  </div>
                </section>

                <section className="panel-section action-links"><h3>{tr("Официальные действия")}</h3>{selectedMethod.links.map((link) => <a className={link.kind === "primary" ? "primary-action full-action" : "official-secondary"} href={lh(link.url)} target="_blank" rel="noreferrer" key={link.url + link.label}>{link.label}<ExternalIcon /></a>)}</section>

                <section className="panel-section expected-result"><h3>{tr("Как понять, что цель достигнута")}</h3><ul>{selectedMethod.expectedResult.map((item) => <li key={item}><CheckIcon /><span>{item}</span></li>)}</ul><div className="outcome-picker" role="group" aria-label={tr("Статус результата")}><button className={outcome === "waiting" ? "selected" : ""} type="button" aria-pressed={outcome === "waiting"} onClick={() => setRouteOutcome("waiting")}>{tr("Отправлено, ожидаю")}</button><button className={outcome === "received" ? "selected" : ""} type="button" aria-pressed={outcome === "received"} disabled={doneSteps.length !== activeSteps.length} onClick={() => setRouteOutcome("received")}>{tr("Результат получен")}</button><button className={outcome === "additional" ? "selected" : ""} type="button" aria-pressed={outcome === "additional"} onClick={() => setRouteOutcome("additional")}>{tr("Нужен дополнительный документ")}</button><button className={outcome === "blocked" ? "selected" : ""} type="button" aria-pressed={outcome === "blocked"} onClick={() => setRouteOutcome("blocked")}>{tr("Не получилось")}</button></div>{doneSteps.length !== activeSteps.length && <small className="local-save-note">{tr("Чтобы отметить результат полученным, сначала завершите все этапы.")}</small>}</section>

                {outcome === "received" && <div className="goal-state success"><CheckIcon /><div><b>{tr("Цель достигнута")}</b><p>{tr("Meldebestätigung получена. Сохраните её и переходите к зависимым действиям, например проверке получения Steuer-ID.")}</p></div></div>}
                {outcome === "waiting" && <div className="goal-state waiting"><span>···</span><div><b>{tr("Результат ожидается")}</b><p>{selectedMethod.processingTime}  {tr("Сохраните официальное подтверждение подачи или записи.")}</p></div></div>}
                {(outcome === "additional" || outcome === "blocked") && <div className="fallback-box"><b>{outcome === "additional" ? tr("Запросили дополнительный документ") : tr("Официальный запасной путь")}</b><ul>{selectedMethod.fallback.map((item) => <li key={item}>{item}</li>)}</ul></div>}
              </>
            )}

            {!viewJourney.actionMethods && <><section className="panel-section"><div className="panel-section-title"><h3>{tr("Чек-лист действий")}</h3><span>{doneSteps.length}/{viewJourney.steps.length}</span></div><ol className="steps-list interactive-steps">{viewJourney.steps.map((item, index) => <li className={doneSteps.includes(index) ? "done" : ""} key={item}><button type="button" aria-pressed={doneSteps.includes(index)} onClick={() => toggleStep(index)} aria-label={doneSteps.includes(index) ? tr("Отметить шаг невыполненным") : tr("Отметить шаг выполненным")}>{doneSteps.includes(index) ? <CheckIcon /> : index + 1}</button><p>{item}</p></li>)}</ol><small className="local-save-note">{tr("Отметки автоматически сохраняются на этом устройстве.")}</small></section><section className="panel-section"><h3>{tr("Подготовьте")}</h3><div className="document-list">{viewJourney.documents.map((item) => <span key={item}>{item}</span>)}</div></section></>}
            <section className="panel-section official-block">
              <div><h3>{tr("Официальные источники")}</h3><small>{tr("Проверено")} {tr(checkedAt)}</small></div>
              {viewJourney.sources.map((source) => <a href={lh(source.url)} target="_blank" rel="noreferrer" key={source.url}><span><b>{source.label}</b><small>{source.organization}</small></span><ExternalIcon /></a>)}
            </section>
            {!selectedMethod && <div className="fallback-box"><b>{tr("Если что-то пошло не так")}</b><p>{viewJourney.fallback}</p></div>}
            <p className="disclaimer">{tr("Перед подачей всегда проверьте актуальные условия, документы и сборы на официальном сайте.")}</p>
          </aside>
        </div>
      )}
    </main>
  );
}
