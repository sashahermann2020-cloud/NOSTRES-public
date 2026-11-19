"use client";

import { currentSource } from "../../traffic-source";
import QuickHelp from "../../QuickHelp";
import { useEffect, useMemo, useState } from "react";
import { explainTerms } from "../../term-explanations";
import ExplainedText from "../../ExplainedText";
import { germanRuns } from "../../german-runs";
import HearingAccess from "../../HearingAccess";
import Link from "../../i18n/link";
import {
  anmeldungProblems,
  getAvailableActionMethods,
  getPersonalizedResult,
  getVisibleQuestions,
  healthProblems,
  journeys,
  taxIdProblems,
  type OfficialSource,
  type RouteProblem,
} from "../../nostres-data";
import { buildAnmeldungSummary } from "../../anmeldung-summary";
import { buildHealthInsuranceSummary } from "../../health-insurance-summary";
import { buildTaxIdSummary } from "../../tax-id-summary";
import ChannelMatrix from "../../ChannelMatrix";
import { factKindFor } from "./fact-kinds";
import { factKindLabels, type FactKind } from "../new-routes/route-model";

type SavedRoute = {
  answers: Record<string, string>;
  doneSteps: number[];
  blockedSteps?: Record<number, string>;
  methodId?: string;
  providerId?: string;
  submitted?: boolean;
  outcome?: string;
  attemptId?: string;
  updatedAt: string;
};

type SavedRoutes = Record<string, SavedRoute>;

import { ROUTE_STORAGE_KEY as STORAGE_KEY, readRouteProgress } from "../../progress-storage";
import { tr, trDeep, trf, useLocale, lh } from "../../i18n/store";
import { ShareAfterRoute } from "../../ShareButton";
import HeaderTools from "../../i18n/HeaderTools";
import { routeCheckedAt } from "../../route-checks";

const routeConfigsRu = {
  anmeldung: {
    location: "Берлин",
    breadcrumb: "Anmeldung",
    categoryLine: "Документы и статус · Берлин",
    heroLede: "Ответьте на вопросы, выберите доступный официальный способ и дойдите до Meldebestätigung. Без платного посредника.",
    facts: [["Срок подачи", "14 дней после въезда"], ["Стоимость", "Бесплатно"], ["Результат", "Meldebestätigung"]],
    heroSourceId: "anmeldung-main",
    heroSourceUrl: "https://service.berlin.de/dienstleistung/120686/",
    scopeNote: "Если вы сохраняете другую квартиру в Германии, регистрируете Nebenwohnung или меняете статус квартир, NOSTRES переведёт вас в личную ветку.",
    singleMethodNote: "Онлайн-способ скрыт, потому что он не подтверждён официальными условиями для ваших ответов.",
    successText: "Meldebestätigung получена. Сохраните её; следующим зависимым маршрутом станет проверка получения Steuer-ID.",
    fallbackSourceIds: ["anmeldung-main", "appointment-rules"],
    sourceUnavailableId: "anmeldung-main",
    fileName: "nostres-anmeldung-summary.txt",
    checkedAt: routeCheckedAt["anmeldung"],
    nextRoute: { href: "/berlin/steuer-id", label: "Перейти к Steuer-ID" },
  },
  "tax-id": {
    location: "Германия · действия в Берлине",
    breadcrumb: "Steuer-ID",
    categoryLine: "Налоги · Германия",
    heroLede: "Определите, присвоена ли вам личная IdNr., и пройдите подходящий официальный путь – без платного посредника и передачи номера NOSTRES.",
    facts: [["Номер", "11 цифр · пожизненно"], ["Стоимость", "Бесплатно"], ["Онлайн-запрос", "В среднем 4 недели"]],
    heroSourceId: "taxid-berlin-main",
    heroSourceUrl: "https://service.berlin.de/dienstleistung/329123/",
    scopeNote: "NOSTRES отличает повторное получение уже присвоенной IdNr. от первой выдачи и не направляет людей без Anmeldung в специальную процедуру, если они обязаны зарегистрировать адрес.",
    singleMethodNote: "Показан один подтверждённый путь для ваших ответов. Другие способы скрыты, чтобы не создавать неправильное или дублирующее заявление.",
    successText: "Steuer-ID найдена или получена. Сохраните номер безопасно: NOSTRES его не запрашивает и не хранит.",
    fallbackSourceIds: ["taxid-berlin-main", "taxid-bzst", "taxid-finanzamt-finder"],
    sourceUnavailableId: "taxid-berlin-main",
    fileName: "nostres-steuer-id-summary.txt",
    checkedAt: routeCheckedAt["tax-id"],
    nextRoute: { href: "/berlin/health-insurance", label: "Перейти к медицинской страховке" },
  },
  health: {
    location: "Германия · действия в Берлине",
    breadcrumb: "Медицинская страховка",
    categoryLine: "Здоровье · Германия",
    heroLede: "Определите официальный путь к страховке, выберите Krankenkasse и получите подтверждение членства и eGK – без платного посредника.",
    facts: [["Обязанность", "Покрытие без разрыва"], ["Каналы", "Онлайн или через кассу"], ["Срок", "Зависит от Krankenkasse"]],
    heroSourceId: "health-overview",
    heroSourceUrl: "https://gesund.bund.de/krankenversicherung",
    scopeNote: "Маршрут отделяет оформление страхования от поиска врача и медицинской срочности. NOSTRES не выбирает за вас GKV или PKV и не собирает медицинские данные.",
    singleMethodNote: "Показан один безопасный официальный путь для ваших ответов. Если режим не подтверждён, сначала требуется письменная проверка Krankenkasse.",
    successText: "Страхование и дата начала подтверждены. Сохраните Versicherungsnachweis, проверьте eGK и передайте сведения работодателю, вузу или Jobcenter, если это относится к вам.",
    fallbackSourceIds: ["health-overview", "health-insured-groups", "health-gkv-list", "health-gkv-pkv"],
    sourceUnavailableId: "health-overview",
    fileName: "nostres-health-insurance-summary.txt",
    checkedAt: routeCheckedAt["health"],
    nextRoute: { href: "/berlin/sozialversicherungsnummer", label: "Номер медстраховки и номер соцстрахования" },
  },
} as const;

const issueTypesRu = [
  { value: "broken_link", label: "Ссылка не открывается" },
  { value: "information_changed", label: "Информация на официальной странице изменилась" },
  { value: "wrong_geography", label: "Указана неправильная география" },
  { value: "unclear_instruction", label: "Непонятно, как выполнить этап" },
  { value: "missing_official_option", label: "Не хватает официального варианта действия" },
];

const blockerOptionsRu = [
  { value: "none", label: "Ничего не мешало" },
  { value: "not_my_case", label: "Не нашёл свою ситуацию" },
  { value: "official_page_unclear", label: "Официальная страница непонятна" },
  { value: "missing_document", label: "Не хватает документа или условия" },
  { value: "no_appointment", label: "Не удалось найти запись" },
  { value: "service_error", label: "Официальный сервис не работает" },
  { value: "other", label: "Другая причина" },
];

type HealthProvider = {
  id: string;
  name: string;
  description: string;
  membershipUrl: string;
  contactUrl: string;
  officeUrl: string;
  studentUrl?: string;
  familyUrl?: string;
};

const healthProvidersRu: HealthProvider[] = [
  {
    id: "aok-nordost",
    name: "AOK Nordost",
    description: "Региональная государственная касса для Берлина. На официальной странице указаны 15 сервисных центров в городе и письменная форма связи.",
    membershipUrl: "https://www.aok.de/mw/nordost/mitgliedsantrag/",
    contactUrl: "https://www.aok.de/pk/kontakt/",
    officeUrl: "https://www.aok.de/pk/nordost/region/berlin/",
    studentUrl: "https://www.aok.de/pk/formulare-antraege/studentische-krankenversicherung/",
    familyUrl: "https://www.aok.de/pk/formulare-antraege/familienversicherung/",
  },
  {
    id: "tk",
    name: "Techniker Krankenkasse (TK)",
    description: "Общенациональная государственная касса. Доступны онлайн-заявление и берлинские отделения.",
    membershipUrl: "https://www.tk.de/techniker/mitglied-werden-2003672",
    contactUrl: "https://www.tk.de/techniker/mitglied-werden/fuer-sie-erreichbar-immer-und-ueberall-2141062",
    officeUrl: "https://www.tk.de/service/app/2024928/filiale/detail.app",
    studentUrl: "https://www.tk.de/techniker/jetzt-zur-tk/mitglied-werden-krankenversicherung-studierende-2090670",
  },
  {
    id: "barmer",
    name: "BARMER",
    description: "Общенациональная государственная касса. Есть онлайн-заявление, письменная форма связи и отделения в Берлине.",
    membershipUrl: "https://www.barmer.de/mitglied-werden",
    contactUrl: "https://www.barmer.de/persoenliche-beratung",
    officeUrl: "https://www.barmer.de/unsere-leistungen/leistungen-a-z/online-services/spezialsuchen/filialuebersicht/berlin-mitte-1101986",
  },
  {
    id: "other",
    name: "Другая государственная касса",
    description: "Откройте официальный список, установите фильтр Berlin и перейдите на сайт выбранной кассы. NOSTRES не ограничивает выбор тремя примерами.",
    membershipUrl: "https://www.gkv-spitzenverband.de/service/krankenkassenliste/krankenkassen.jsp?filter=8",
    contactUrl: "https://www.gkv-spitzenverband.de/service/krankenkassenliste/krankenkassen.jsp?filter=8",
    officeUrl: "https://www.gkv-spitzenverband.de/service/krankenkassenliste/krankenkassen.jsp?filter=8",
  },
];

function providerPrimaryAction(provider: HealthProvider, methodId: string) {
  if (provider.id === "other") return { url: provider.membershipUrl, label: "Открыть полный официальный список" };
  if (methodId === "health-employee-direct") return { url: provider.officeUrl, label: "Найти офис и условия приёма" };
  if (methodId === "health-family") return provider.familyUrl
    ? { url: provider.familyUrl, label: "Открыть заявление для семьи" }
    : { url: provider.contactUrl, label: "Запросить семейное страхование письменно" };
  if (methodId === "health-student") return { url: provider.contactUrl, label: "Проверить статус для зачисления письменно" };
  if (["health-egk", "health-clarify", "health-benefit"].includes(methodId)) return { url: provider.contactUrl, label: "Отправить письменный запрос кассе" };
  return { url: provider.membershipUrl, label: "Открыть онлайн-заявление" };
}

function providerDisplayName(provider: HealthProvider) {
  return provider.id === "aok-nordost" ? tr("AOK Nordost (региональная больничная касса)") : explainTerms(provider.name);
}

const providerChoiceMode: Partial<Record<string, "choose" | "current" | "current-or-new">> = {
  "health-employee-online": "choose",
  "health-employee-direct": "choose",
  "health-student": "choose",
  "health-family": "current",
  "health-benefit": "current-or-new",
  "health-egk": "current",
  "health-switch-gkv": "choose",
  "health-clarify": "choose",
};

const primaryActionStep: Record<string, number> = {
  "anmeldung-online": 3,
  "anmeldung-personal": 2,
  "taxid-find": 0,
  "taxid-wait": 0,
  "taxid-online": 0,
  "taxid-urgent": 1,
  "taxid-anmeldung-first": 1,
  "taxid-nonresident-employee": 1,
  "taxid-nonresident-tax": 1,
  "health-employee-online": 1,
  "health-employee-direct": 0,
  "health-student": 1,
  "health-family": 1,
  "health-benefit": 0,
  "health-egk": 0,
  "health-switch-gkv": 0,
  "health-clarify": 0,
};



function createAttemptId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `attempt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function postMvpPayload(payload: Record<string, unknown>) {
  const response = await fetch("/api/mvp-events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  });
  if (!response.ok) throw new Error("Сервис временно не сохранил сообщение");
}

function ExternalIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M11 4h5v5M9 11l7-7M16 12v4H4V4h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
}

function CheckIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>;
}

function saveRoutes(routes: SavedRoutes) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
  } catch {
    // Маршрут остаётся рабочим, даже если браузер блокирует localStorage.
  }
}

function sourceMap(sources: OfficialSource[]) {
  return new Map(sources.filter((source) => source.id).map((source) => [source.id as string, source]));
}

function EvidenceLinks({ ids, sources }: { ids?: string[]; sources: Map<string, OfficialSource> }) {
  if (!ids?.length) return null;
  const matched = ids.map((id) => sources.get(id)).filter((source): source is OfficialSource => Boolean(source));
  if (!matched.length) return null;
  return (
    <details className="evidence-links">
      <summary>{germanRuns(tr("Официальный источник"))}</summary>
      <div aria-label={tr("Источники этого вывода")}>
      {matched.map((source) => <a href={lh(source.url)} target="_blank" rel="noreferrer" key={source.url}>{source.organization}<ExternalIcon /></a>)}
      </div>
    </details>
  );
}

function FactCard({ label, value, ids, sources, kind }: { label: string; value: string; ids?: string[]; sources: Map<string, OfficialSource>; kind?: FactKind }) {
  return <div><small>{label}</small><b>{germanRuns(value)}</b>{kind && <span className="fact-kind">{germanRuns(tr(factKindLabels[kind]))}</span>}<EvidenceLinks ids={ids} sources={sources} /></div>;
}

function focusAndScroll(id: string, block: ScrollLogicalPosition = "start") {
  const target = document.getElementById(id);
  target?.focus();
  target?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block });
}

export default function AnmeldungJourney({ journeyId = "anmeldung" }: { journeyId?: "anmeldung" | "tax-id" | "health" }) {
  const locale = useLocale();
  const rawJourney = journeys.find((item) => item.id === journeyId)!;
  const journey = useMemo(() => trDeep(rawJourney), [locale, rawJourney]); // eslint-disable-line react-hooks/exhaustive-deps
  const config = useMemo(() => trDeep(routeConfigsRu[journeyId]), [locale, journeyId]); // eslint-disable-line react-hooks/exhaustive-deps
  const issueTypes = useMemo(() => trDeep(issueTypesRu), [locale]); // eslint-disable-line react-hooks/exhaustive-deps
  const blockerOptions = useMemo(() => trDeep(blockerOptionsRu), [locale]); // eslint-disable-line react-hooks/exhaustive-deps
  const healthProviders = useMemo(() => trDeep(healthProvidersRu), [locale]); // eslint-disable-line react-hooks/exhaustive-deps
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [blockedSteps, setBlockedSteps] = useState<Record<number, string>>({});
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(false);
  const [outcome, setOutcome] = useState("");
  const [savedRoutes, setSavedRoutes] = useState<SavedRoutes>({});
  const [loaded, setLoaded] = useState(false);
  const [attemptId, setAttemptId] = useState("");
  const [activeProblemStep, setActiveProblemStep] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [reportSourceId, setReportSourceId] = useState("");
  const [reportIssueType, setReportIssueType] = useState("broken_link");
  const [reportStatus, setReportStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [feedbackClarity, setFeedbackClarity] = useState(0);
  const [feedbackNextAction, setFeedbackNextAction] = useState("");
  const [feedbackOfficialAction, setFeedbackOfficialAction] = useState("");
  const [feedbackBlocker, setFeedbackBlocker] = useState("none");
  const [routeFeedbackStatus, setRouteFeedbackStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = readRouteProgress();
        const parsed = stored ? JSON.parse(stored) as SavedRoutes : {};
        const saved = parsed[journey.id];
        const nextAttemptId = saved?.attemptId ?? createAttemptId();
        setSavedRoutes(parsed);
        setAnswers(saved?.answers ?? {});
        const currentFlow = saved?.submitted === true;
        setDoneSteps(currentFlow ? saved.doneSteps : []);
        setBlockedSteps(currentFlow ? saved.blockedSteps ?? {} : {});
        setSelectedMethodId(currentFlow ? saved.methodId ?? "" : "");
        setSelectedProviderId(currentFlow ? saved.providerId ?? "" : "");
        setQuestionnaireSubmitted(currentFlow);
        setOutcome(currentFlow ? saved.outcome ?? "" : "");
        setAttemptId(nextAttemptId);
        void postMvpPayload({ kind: "event", eventName: "situation_opened", elementId: currentSource(), routeId: journey.id, attemptId: nextAttemptId }).catch(() => undefined);
      } catch {
        setSavedRoutes({});
        setAttemptId(createAttemptId());
      } finally {
        setLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [journey.id]);

  const visibleQuestions = trDeep(getVisibleQuestions(rawJourney, answers));
  const personalizedResult = trDeep(getPersonalizedResult(journey.id, answers));
  const availableMethods = trDeep(getAvailableActionMethods(rawJourney, answers));
  const selectedMethod = availableMethods.find((method) => method.id === selectedMethodId) ?? null;
  const selectedProvider = healthProviders.find((provider) => provider.id === selectedProviderId) ?? null;
  const providerMode = selectedMethod ? providerChoiceMode[selectedMethod.id] : undefined;
  const routeIsReady = Boolean(selectedMethod && (!providerMode || selectedProvider));
  const sources = sourceMap(journey.sources);
  const answeredCount = visibleQuestions.filter((question) => answers[question.id]).length;
  const questionnairePercent = Math.round((answeredCount / visibleQuestions.length) * 100);
  const stepsPercent = selectedMethod ? Math.round((doneSteps.length / selectedMethod.steps.length) * 100) : 0;
  const methodProblems = selectedMethod
    ? trDeep((journey.id === "anmeldung" ? anmeldungProblems : journey.id === "tax-id" ? taxIdProblems : healthProblems)).filter((problem) => problem.methodTypes.includes(selectedMethod.type))
    : [];

  function recordEvent(eventName: string, details: Record<string, unknown> = {}) {
    if (!attemptId) return;
    void postMvpPayload({ kind: "event", eventName, routeId: journey.id, attemptId, ...details }).catch(() => undefined);
  }

  function persist(
    nextAnswers: Record<string, string>,
    nextSteps: number[],
    methodId: string,
    nextOutcome: string,
    nextBlocked = blockedSteps,
    nextSubmitted = questionnaireSubmitted,
    nextProviderId = selectedProviderId,
  ) {
    const nextRoutes: SavedRoutes = {
      ...savedRoutes,
      [journey.id]: {
        answers: nextAnswers,
        doneSteps: nextSteps,
        blockedSteps: nextBlocked,
        methodId: methodId || undefined,
        providerId: nextProviderId || undefined,
        submitted: nextSubmitted || undefined,
        outcome: nextOutcome || undefined,
        attemptId: attemptId || createAttemptId(),
        updatedAt: new Date().toISOString(),
      },
    };
    setSavedRoutes(nextRoutes);
    saveRoutes(nextRoutes);
  }

  function answerQuestion(questionId: string, value: string) {
    const nextAnswers = { ...answers, [questionId]: value };
    setAnswers(nextAnswers);
    setSelectedMethodId("");
    setSelectedProviderId("");
    setQuestionnaireSubmitted(false);
    setDoneSteps([]);
    setBlockedSteps({});
    setOutcome("");
    persist(nextAnswers, [], "", "", {}, false, "");
    recordEvent("question_answered", { elementId: questionId });
  }

  function submitQuestionnaire() {
    if (!personalizedResult) return;
    setQuestionnaireSubmitted(true);
    setSelectedMethodId("");
    setSelectedProviderId("");
    setDoneSteps([]);
    setBlockedSteps({});
    setOutcome("");
    persist(answers, [], "", "", {}, true, "");
    recordEvent("route_result_generated");
    window.setTimeout(() => focusAndScroll("personal-result", "start"), 0);
  }

  function editAnswers() {
    setQuestionnaireSubmitted(false);
    setSelectedMethodId("");
    setSelectedProviderId("");
    setDoneSteps([]);
    setBlockedSteps({});
    setOutcome("");
    persist(answers, [], "", "", {}, false, "");
    window.setTimeout(() => focusAndScroll("questions", "start"), 0);
  }

  function chooseMethod(methodId: string) {
    setSelectedMethodId(methodId);
    setSelectedProviderId("");
    setQuestionnaireSubmitted(true);
    setDoneSteps([]);
    setBlockedSteps({});
    setOutcome("");
    setFeedbackClarity(0);
    setFeedbackNextAction("");
    setFeedbackOfficialAction("");
    setFeedbackBlocker("none");
    setRouteFeedbackStatus("idle");
    persist(answers, [], methodId, "", {}, true, "");
    recordEvent("action_method_selected", { methodId });
    window.setTimeout(() => document.getElementById(providerChoiceMode[methodId] ? "provider-choice" : "route-steps")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function chooseProvider(providerId: string) {
    setSelectedProviderId(providerId);
    persist(answers, [], selectedMethodId, "", {}, true, providerId);
    recordEvent("insurance_provider_selected", { methodId: selectedMethodId, elementId: providerId });
    window.setTimeout(() => focusAndScroll("route-steps", "start"), 0);
  }

  function changeMethod() {
    setSelectedMethodId("");
    setSelectedProviderId("");
    setDoneSteps([]);
    setBlockedSteps({});
    setOutcome("");
    persist(answers, [], "", "", {}, true, "");
    window.setTimeout(() => focusAndScroll("method-choice", "start"), 0);
  }

  function changeProvider() {
    setSelectedProviderId("");
    setDoneSteps([]);
    setBlockedSteps({});
    setOutcome("");
    persist(answers, [], selectedMethodId, "", {}, true, "");
    window.setTimeout(() => focusAndScroll("provider-choice", "start"), 0);
  }

  function toggleStep(index: number) {
    if (!selectedMethod) return;
    const nextSteps = doneSteps.includes(index) ? doneSteps.filter((item) => item !== index) : [...doneSteps, index].sort();
    const nextBlocked = { ...blockedSteps };
    if (!doneSteps.includes(index)) delete nextBlocked[index];
    setDoneSteps(nextSteps);
    setBlockedSteps(nextBlocked);
    persist(answers, nextSteps, selectedMethodId, outcome, nextBlocked);
    recordEvent(doneSteps.includes(index) ? "step_reopened" : "step_completed", { methodId: selectedMethodId, stepIndex: index });
  }

  function setRouteOutcome(nextOutcome: string) {
    setOutcome(nextOutcome);
    persist(answers, doneSteps, selectedMethodId, nextOutcome);
    const eventName = nextOutcome === "received" ? "goal_achieved"
      : nextOutcome === "waiting" ? "result_waiting"
        : nextOutcome === "additional" ? "additional_document_requested"
          : nextOutcome === "refused" ? "official_refusal_reported"
            : "step_blocked";
    recordEvent(eventName, { methodId: selectedMethodId });
  }

  function setStepProblem(index: number, problem: RouteProblem) {
    const nextSteps = doneSteps.filter((item) => item !== index);
    const nextBlocked = { ...blockedSteps, [index]: problem.id };
    setDoneSteps(nextSteps);
    setBlockedSteps(nextBlocked);
    setActiveProblemStep(null);
    persist(answers, nextSteps, selectedMethodId, outcome, nextBlocked);
    recordEvent("step_blocked", { methodId: selectedMethodId, stepIndex: index, problemCode: problem.id });
  }

  function clearStepProblem(index: number) {
    const nextBlocked = { ...blockedSteps };
    delete nextBlocked[index];
    setBlockedSteps(nextBlocked);
    persist(answers, doneSteps, selectedMethodId, outcome, nextBlocked);
    recordEvent("step_unblocked", { methodId: selectedMethodId, stepIndex: index });
  }

  function summaryText() {
    if (!selectedMethod) return "";
    const input = { method: selectedMethod, doneSteps, blockedSteps, outcome, sources: journey.sources, generatedAt: new Date() };
    return journey.id === "anmeldung" ? buildAnmeldungSummary(input) : journey.id === "tax-id" ? buildTaxIdSummary(input) : buildHealthInsuranceSummary(input);
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summaryText());
      setCopied(true);
      recordEvent("summary_copied", { methodId: selectedMethodId });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function downloadSummary() {
    const url = URL.createObjectURL(new Blob([summaryText()], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = config.fileName;
    link.click();
    URL.revokeObjectURL(url);
    recordEvent("summary_downloaded", { methodId: selectedMethodId });
  }

  function printSummary() {
    recordEvent("summary_printed", { methodId: selectedMethodId });
    window.print();
  }

  async function submitIssueReport() {
    if (!reportSourceId || !attemptId) return;
    setReportStatus("sending");
    try {
      await postMvpPayload({ kind: "issue", routeId: journey.id, methodId: selectedMethodId || null, sourceId: reportSourceId, issueType: reportIssueType, attemptId });
      recordEvent("issue_reported", { methodId: selectedMethodId || null, elementId: reportSourceId, problemCode: reportIssueType });
      setReportStatus("sent");
    } catch {
      setReportStatus("error");
    }
  }

  async function submitRouteFeedback() {
    if (!attemptId || !selectedMethod || !feedbackClarity || !feedbackNextAction || !feedbackOfficialAction) return;
    setRouteFeedbackStatus("sending");
    try {
      await postMvpPayload({
        kind: "feedback",
        routeId: journey.id,
        methodId: selectedMethod.id,
        outcome: outcome || null,
        clarityRating: feedbackClarity,
        nextActionStatus: feedbackNextAction,
        officialActionStatus: feedbackOfficialAction,
        blockerCode: feedbackBlocker,
        attemptId,
      });
      recordEvent("route_feedback_submitted", { methodId: selectedMethod.id, problemCode: feedbackBlocker });
      setRouteFeedbackStatus("sent");
    } catch {
      setRouteFeedbackStatus("error");
    }
  }

  function openReport(sourceId: string) {
    setReportSourceId(sourceId);
    setReportStatus("idle");
    window.setTimeout(() => focusAndScroll("report-source", "center"), 0);
  }

  function resetRoute() {
    const nextRoutes = { ...savedRoutes };
    delete nextRoutes[journey.id];
    setSavedRoutes(nextRoutes);
    setAnswers({});
    setDoneSteps([]);
    setBlockedSteps({});
    setSelectedMethodId("");
    setSelectedProviderId("");
    setQuestionnaireSubmitted(false);
    setOutcome("");
    setFeedbackClarity(0);
    setFeedbackNextAction("");
    setFeedbackOfficialAction("");
    setFeedbackBlocker("none");
    setRouteFeedbackStatus("idle");
    setAttemptId(createAttemptId());
    saveRoutes(nextRoutes);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="route-page" id="top" tabIndex={-1}>
      <header className="site-header route-page-header">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true" data-mark="N" />
          <span className="brand-copy"><b>NOSTRES</b><small>{germanRuns(tr("Понятный путь"))}</small></span>
        </Link>
        <Link className="plan-return" href="/berlin/start">{germanRuns(tr("Мой план"))}</Link>
        <div className="header-actions"><Link className="back-link" href="/">{germanRuns(tr("Все маршруты"))}</Link><HeaderTools /></div>
      </header>

      <section className={`route-hero${questionnaireSubmitted ? " route-hero-complete" : ""}`}>
        <div className="route-breadcrumb"><Link href="/">{germanRuns(tr("Маршруты"))}</Link><span>/</span><span>{config.location}</span><span>/</span><b>{config.breadcrumb}</b></div>
        <div className={`route-hero-grid${questionnaireSubmitted ? " has-facts" : ""}`}>
          <div>
            <p className="overline">{config.categoryLine}</p>
            <h1><ExplainedText text={journey.title} /></h1>
            <p className="route-hero-lede">{germanRuns(explainTerms(config.heroLede))}</p>
          </div>
          {questionnaireSubmitted && <div className="route-hero-facts">
            {config.facts.map(([label, value]) => <div key={label}><small>{label}</small><b>{germanRuns(explainTerms(value))}</b></div>)}
          </div>}
        </div>
      </section>

      <div className={`route-layout${questionnaireSubmitted ? "" : " questionnaire-active"}`}>
        {questionnaireSubmitted && <aside className="route-rail" aria-label={tr("Прогресс маршрута")}>
          <div className="rail-card">
            <span className="rail-kicker">{germanRuns(tr("Ваш прогресс"))}</span>
            <div className="rail-progress"><span style={{ width: `${selectedMethod ? stepsPercent : questionnairePercent}%` }} /></div>
            <b>{selectedMethod && routeIsReady ? trf("{done} из {total} этапов", { done: doneSteps.length, total: selectedMethod.steps.length }) : questionnaireSubmitted ? tr("Ответ получен") : trf(visibleQuestions.length === 1 ? "{done} из {total} вопроса" : "{done} из {total} вопросов", { done: answeredCount, total: visibleQuestions.length })}</b>
            <small>{loaded ? tr("Сохраняется только на этом устройстве") : tr("Загружаем сохранённый маршрут…")}</small>
          </div>
          {questionnaireSubmitted && <div className="rail-card rail-status"><span>{germanRuns(tr("География"))}</span><b>{config.location}</b><span>{germanRuns(tr("Проверено"))}</span><b>{config.checkedAt}</b><span>{germanRuns(tr("Тип"))}</span><b>{germanRuns(tr("Официальный маршрут"))}</b></div>}
          <div className="rail-card rail-privacy"><b>{germanRuns(tr("Ваши ответы остаются у вас"))}</b><p>{germanRuns(tr("NOSTRES сохраняет их только в браузере этого устройства. Имя, документы и номера не запрашиваются."))}</p></div>
          {routeIsReady && <div className="rail-card rail-test"><b>{germanRuns(tr("Проверяете NOSTRES?"))}</b><p>{germanRuns(tr("Пройдите путь до официального действия и оставьте короткую анонимную оценку."))}</p><Link href="/mvp-test">{germanRuns(tr("Как проходит тест"))}</Link><a href="#route-evaluation">{germanRuns(tr("Оценить этот маршрут"))}</a></div>}
          <button className="reset-route" type="button" onClick={resetRoute}>{germanRuns(tr("Начать заново"))}</button>
        </aside>}

        <div className="route-main">
          {!questionnaireSubmitted && <section className="route-section questionnaire" id="questions" tabIndex={-1}>
            <div className="route-section-heading"><div><p className="overline">{germanRuns(tr("Шаг 1"))}</p><h2>{germanRuns(tr("Ответьте на вопросы"))}</h2></div><span>{answeredCount}/{visibleQuestions.length}</span></div>
            <p className="questionnaire-intro">{germanRuns(tr("Сначала NOSTRES соберёт только необходимые ответы. Персональный результат и действия появятся после кнопки внизу."))}</p>
            {visibleQuestions.map((question, questionIndex) => (
              <fieldset className="route-question route-page-question" key={question.id}>
                <legend><span>{questionIndex + 1}</span>{germanRuns(explainTerms(question.prompt))}</legend>
                {question.hint && <details className="question-help"><summary>{germanRuns(tr("Пояснение к вопросу"))}</summary><p>{germanRuns(explainTerms(question.hint))}</p></details>}
                {question.guide && <details className="question-help"><summary>{germanRuns(tr("Что это значит?"))}</summary><div className="question-guide"><strong><ExplainedText text={question.guide.title} /></strong><p>{germanRuns(explainTerms(question.guide.intro))}</p><ul>{question.guide.items.map((item) => <li key={item}>{germanRuns(explainTerms(item))}</li>)}</ul><div>{question.guide.links.map((link) => <a href={lh(link.url)} target="_blank" rel="noreferrer" key={link.url}>{germanRuns(explainTerms(link.label))}<ExternalIcon /></a>)}</div></div></details>}
                <div className="option-grid">
                  {question.options.map((option) => (
                    <label className={answers[question.id] === option.value ? "selected" : ""} key={option.value}>
                      <input type="radio" name={question.id} value={option.value} checked={answers[question.id] === option.value} onChange={() => answerQuestion(question.id, option.value)} />
                      <span>{germanRuns(explainTerms(option.label))}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <div className="questionnaire-submit"><button className="primary-action questionnaire-result-button" type="button" disabled={!personalizedResult} onClick={submitQuestionnaire}>{germanRuns(tr("Получить персональный маршрут"))}</button>{!personalizedResult && <small>{germanRuns(tr("Ответьте на все показанные вопросы."))}</small>}</div>
            {answeredCount > 0 && <button className="reset-route questionnaire-reset" type="button" onClick={resetRoute}>{germanRuns(tr("Очистить ответы и начать заново"))}</button>}
          </section>}

          {questionnaireSubmitted && personalizedResult && !selectedMethod && (
            <section className="personal-result route-result" id="personal-result" tabIndex={-1} aria-live="polite">
              <span className="result-kicker"><CheckIcon />  {germanRuns(tr("Ваш персональный результат"))}</span>
              <h2><ExplainedText text={personalizedResult.title} /></h2>
              <p>{germanRuns(explainTerms(personalizedResult.text))}</p>
              {personalizedResult.warning && <div className="result-warning">{germanRuns(explainTerms(personalizedResult.warning))}</div>}
              {availableMethods.length === 0 && <div className="terminal-result"><b>{germanRuns(tr("Что делать сейчас"))}</b><p>{germanRuns(tr("По вашим ответам отдельное заявление сейчас не предусмотрено. Если ситуация изменится, вернитесь и обновите ответы."))}</p><a className="primary-action" href={lh(personalizedResult.actionUrl)} target="_blank" rel="noreferrer">{germanRuns(explainTerms(personalizedResult.actionLabel))}<ExternalIcon /></a></div>}
              <div className="result-controls"><button className="official-secondary" type="button" onClick={editAnswers}>{germanRuns(tr("Изменить ответы"))}</button><details className="result-evidence"><summary>{germanRuns(tr("Почему такой результат?"))}</summary><p>{germanRuns(explainTerms(config.scopeNote))}</p><a href={lh(personalizedResult.actionUrl)} target="_blank" rel="noreferrer" onClick={() => recordEvent("official_source_opened", { elementId: personalizedResult.actionUrl })}>{germanRuns(tr("Открыть официальное основание"))} <ExternalIcon /></a></details></div>
            </section>
          )}

          {questionnaireSubmitted && personalizedResult && !selectedMethod && availableMethods.length > 0 && (
            <section className="route-section method-section" id="method-choice" tabIndex={-1}>
              <div className="route-section-heading"><div><p className="overline">{germanRuns(tr("Шаг 2"))}</p><h2>{availableMethods.length > 1 ? tr("Выберите способ") : tr("Ваш способ")}</h2></div><span>{availableMethods.length}</span></div>
              <div className="method-grid route-method-grid">
                {availableMethods.map((method) => (
                  <button className={selectedMethodId === method.id ? "method-card selected" : "method-card"} type="button" key={method.id} onClick={() => chooseMethod(method.id)}>
                    <span className="method-card-top"><b>{method.type === "online" ? tr("Онлайн") : method.id === "health-employee-direct" ? tr("Лично / письменно") : method.type === "in-person" ? tr("Лично") : tr("По ситуации")}</b><small>{method.badge}</small></span>
                    <strong><ExplainedText text={method.title} /></strong>
                    <p>{germanRuns(explainTerms(method.summary))}</p>
                    <span className={`availability ${method.availability}`}>{germanRuns(explainTerms(method.availabilityLabel))}</span>
                    <span className="method-cta">{germanRuns(tr("Открыть этот путь"))}</span>
                  </button>
                ))}
              </div>
              {availableMethods.length === 1 && journey.id === "anmeldung" && <p className="method-note">{germanRuns(explainTerms(config.singleMethodNote))}</p>}
            </section>
          )}

          {selectedMethod && providerMode && !selectedProvider && (
            <section className="route-section provider-choice" id="provider-choice" tabIndex={-1}>
              <div className="route-section-heading"><div><p className="overline">{germanRuns(tr("Шаг 3"))}</p><h2>{selectedMethod.id === "health-clarify" ? tr("Куда отправить запрос на проверку") : providerMode === "current" ? tr("Выберите вашу кассу") : providerMode === "current-or-new" ? tr("Укажите текущую или новую кассу") : tr("Выберите больничную кассу")}</h2></div></div>
              <p className="provider-intro">{germanRuns(tr("Это не рейтинг. Ниже: три примера государственных касс, доступных в Берлине, и полный официальный список. Сравните взнос, письменный сервис и отделения."))}</p>
              {selectedMethod.id === "health-clarify" && <div className="provider-rule">{germanRuns(tr("Это выбор адресата для письменной проверки, а не рекомендация вступить в государственную кассу. Если подтвердится право на частное страхование, следующий этап покажет официальный список частных компаний."))}</div>}
              {providerMode === "current" && <div className="provider-rule">{germanRuns(tr("Используйте действующую кассу: для семейного страхования – кассу члена семьи, для медицинской карты – кассу, где уже подтверждено членство."))}</div>}
              <div className="provider-grid">
                {healthProviders.map((provider) => <article className="provider-card" key={provider.id}><div><span>{provider.id === "other" ? tr("Полный список") : tr("Официальная касса")}</span><h3>{providerDisplayName(provider)}</h3><p>{germanRuns(explainTerms(provider.description))}</p></div><button type="button" onClick={() => chooseProvider(provider.id)}>{provider.id === "other" ? tr("Выбрать другую кассу") : trf("Выбрать {name}", { name: provider.name })}</button></article>)}
              </div>
              <button className="text-action" type="button" onClick={changeMethod}>{germanRuns(tr("Вернуться к выбору способа"))}</button>
            </section>
          )}

          {selectedMethod && routeIsReady && (
            <div id="route-steps" tabIndex={-1}>
              <div className="route-path-controls"><button type="button" onClick={changeMethod}>{germanRuns(tr("Изменить способ"))}</button>{providerMode && <button type="button" onClick={changeProvider}>{germanRuns(tr("Изменить кассу"))}</button>}</div>

              {selectedProvider && providerMode && <section className="route-section selected-provider"><div><p className="overline">{germanRuns(tr("Выбранная касса"))}</p><h2>{providerDisplayName(selectedProvider)}</h2><p>{germanRuns(explainTerms(selectedProvider.description))}</p>{selectedMethod.id === "health-clarify" && <details className="written-request"><summary>{germanRuns(tr("Что написать для проверки"))}</summary><p>{germanRuns(tr("В официальной форме контакта выбранной кассы попросите письменно проверить, обязаны ли вы вступить в государственную систему, можете ли вступить добровольно, какие документы нужны и с какой даты начнётся покрытие. Укажите текущую страховку, основание пребывания, занятость и доход. Медицинские документы передавайте только через защищённый канал самой кассы."))}</p></details>}</div><div className="selected-provider-actions"><a className="primary-action" href={lh(providerPrimaryAction(selectedProvider, selectedMethod.id).url)} target="_blank" rel="noreferrer">{providerPrimaryAction(selectedProvider, selectedMethod.id).label}<ExternalIcon /></a>{selectedProvider.id !== "other" && <>{selectedProvider.contactUrl !== providerPrimaryAction(selectedProvider, selectedMethod.id).url && <a className="official-secondary" href={lh(selectedProvider.contactUrl)} target="_blank" rel="noreferrer">{germanRuns(tr("Письменный контакт"))}<ExternalIcon /></a>}{selectedProvider.officeUrl !== providerPrimaryAction(selectedProvider, selectedMethod.id).url && <a className="official-secondary" href={lh(selectedProvider.officeUrl)} target="_blank" rel="noreferrer">{germanRuns(tr("Найти офис в Берлине"))}<ExternalIcon /></a>}{selectedMethod.id === "health-student" && selectedProvider.studentUrl && <a className="official-secondary" href={lh(selectedProvider.studentUrl)} target="_blank" rel="noreferrer">{germanRuns(tr("Заявление на студенческое страхование"))}<ExternalIcon /></a>}</>}</div></section>}

              <details className="route-section preparation-details">
                <summary>{germanRuns(tr("Что подготовить до начала"))}</summary>
                <div className="split-section-inner">
                  <div><h3>{germanRuns(tr("Условия"))}</h3><ul className="requirement-list">{selectedMethod.prerequisites.map((item) => <li key={item}><CheckIcon /><span>{germanRuns(explainTerms(item))}</span></li>)}</ul></div>
                  <div><h3>{germanRuns(tr("Документы и данные"))}</h3><ul className="document-list">{selectedMethod.documents.map((item) => <li key={item}>{germanRuns(explainTerms(item))}</li>)}</ul></div>
                </div>
                <EvidenceLinks ids={selectedMethod.sourceIds} sources={sources} />
              </details>

              <section className="route-section route-steps-section">
                <div className="route-section-heading"><div><p className="overline">{germanRuns(tr("Шаг"))} {providerMode ? "4" : "3"}</p><h2>{germanRuns(tr("Выполните этапы"))}</h2></div><span>{doneSteps.length}/{selectedMethod.steps.length}</span></div>
                <ol className="route-step-list">
                  {selectedMethod.steps.map((item, index) => {
                    const problemCatalog = trDeep(journey.id === "anmeldung" ? anmeldungProblems : journey.id === "tax-id" ? taxIdProblems : healthProblems);
                    const problem = blockedSteps[index] ? problemCatalog.find((entry) => entry.id === blockedSteps[index]) : null;
                    return (
                      <li className={doneSteps.includes(index) ? "done" : problem ? "blocked" : ""} key={item}>
                        <button type="button" aria-pressed={doneSteps.includes(index)} onClick={() => toggleStep(index)} aria-label={doneSteps.includes(index) ? tr("Отметить этап невыполненным") : tr("Отметить этап выполненным")}>{doneSteps.includes(index) ? <CheckIcon /> : index + 1}</button>
                        <div>
                          <p>{germanRuns(explainTerms(item))}</p>
                          {primaryActionStep[selectedMethod.id] === index && selectedMethod.links[0] && <div className="step-actions"><a className="primary-action" href={lh(selectedMethod.links[0].url)} target="_blank" rel="noreferrer" onClick={() => recordEvent("official_source_opened", { methodId: selectedMethodId, stepIndex: index, elementId: selectedMethod.links[0].url })}>{germanRuns(explainTerms(selectedMethod.links[0].label))}<ExternalIcon /></a>{selectedMethod.links.length > 1 && <details><summary>{germanRuns(tr("Дополнительные официальные ссылки"))}</summary><div>{selectedMethod.links.slice(1).map((link) => <a className="official-secondary" href={lh(link.url)} target="_blank" rel="noreferrer" key={link.url + link.label}>{germanRuns(explainTerms(link.label))}<ExternalIcon /></a>)}</div></details>}</div>}
                          {selectedMethod.id === "health-clarify" && index === 2 && <div className="step-actions"><a className="official-secondary" href="https://www.pkv.de/verband/ueber-uns/mitglieder-pkv-verband/" target="_blank" rel="noreferrer">{germanRuns(tr("Открыть список частных страховщиков и контакты"))}<ExternalIcon /></a></div>}
                          {selectedMethod.id === "taxid-find" && index === 3 && <div className="step-actions"><a className="primary-action" href="https://www.elster.de/bportal/formulare-leistungen/alleformulare/idnr" target="_blank" rel="noreferrer">{germanRuns(tr("Открыть повторный онлайн-запрос номера"))}<ExternalIcon /></a></div>}
                          <EvidenceLinks ids={selectedMethod.stepSourceIds?.[index]} sources={sources} />
                          {!doneSteps.includes(index) && !problem && <button className="step-problem-toggle" type="button" onClick={() => setActiveProblemStep(activeProblemStep === index ? null : index)}>{germanRuns(tr("Есть проблема с этим этапом"))}</button>}
                          {activeProblemStep === index && !problem && <div className="problem-picker"><b>{germanRuns(tr("Что мешает продолжить?"))}</b>{methodProblems.map((entry) => <button type="button" key={entry.id} onClick={() => setStepProblem(index, entry)}>{germanRuns(explainTerms(entry.label))}</button>)}<button className="problem-cancel" type="button" onClick={() => setActiveProblemStep(null)}>{germanRuns(tr("Закрыть"))}</button></div>}
                          {problem && <div className="step-problem-card"><span>{germanRuns(tr("Этап заблокирован"))}</span><h3><ExplainedText text={problem.title} /></h3><p>{germanRuns(explainTerms(problem.description))}</p><EvidenceLinks ids={problem.sourceIds} sources={sources} /><div className="problem-actions">{problem.actions.map((link) => <a className={link.kind === "primary" ? "primary-action" : "official-secondary"} href={lh(link.url)} target="_blank" rel="noreferrer" key={link.url} onClick={() => recordEvent("official_source_opened", { methodId: selectedMethodId, stepIndex: index, elementId: link.url })}>{germanRuns(explainTerms(link.label))}<ExternalIcon /></a>)}</div>{problem.switchToMethodId && <button className="switch-method" type="button" onClick={() => chooseMethod(problem.switchToMethodId!)}>{germanRuns(tr("Перейти на личный способ"))}</button>}{problem.id.endsWith("source_unavailable") && <button className="switch-method" type="button" onClick={() => openReport(config.sourceUnavailableId)}>{germanRuns(tr("Сообщить о неработающей ссылке"))}</button>}<button className="problem-resolved" type="button" onClick={() => clearStepProblem(index)}>{germanRuns(tr("Проблема решена"))}</button></div>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <small className="local-save-note">{germanRuns(tr("Выполненные и заблокированные этапы сохраняются только в браузере этого устройства."))}</small>
                <QuickHelp onVote={(eventName) => recordEvent(eventName, { methodId: selectedMethodId })} />
              </section>

              <section className="method-detail route-method-detail" aria-live="polite">
                <div className="method-detail-heading"><span>{selectedMethod.type === "online" ? tr("Полностью онлайн") : selectedMethod.type === "in-person" ? tr("Личное посещение") : tr("Комбинированный путь")}</span><h2><ExplainedText text={selectedMethod.title} /></h2><p>{germanRuns(explainTerms(selectedMethod.summary))}</p></div>
                <div className="timeline-grid verified-facts">
                  <FactCard label={tr("Подать")} value={explainTerms(selectedMethod.deadline)} ids={selectedMethod.factSourceIds?.deadline} sources={sources} kind={factKindFor(selectedMethod.id, "deadline")} />
                  <FactCard label={tr("Подготовка")} value={explainTerms(selectedMethod.preparationTime)} ids={selectedMethod.factSourceIds?.preparationTime} sources={sources} kind={factKindFor(selectedMethod.id, "preparationTime")} />
                  <FactCard label={tr("Запись")} value={explainTerms(selectedMethod.appointmentTime)} ids={selectedMethod.factSourceIds?.appointmentTime} sources={sources} kind={factKindFor(selectedMethod.id, "appointmentTime")} />
                  <FactCard label={tr("Исполнение")} value={explainTerms(selectedMethod.processingTime)} ids={selectedMethod.factSourceIds?.processingTime} sources={sources} kind={factKindFor(selectedMethod.id, "processingTime")} />
                  <FactCard label={tr("Стоимость")} value={explainTerms(selectedMethod.fee)} ids={selectedMethod.factSourceIds?.fee} sources={sources} kind={factKindFor(selectedMethod.id, "fee")} />
                </div>
              </section>

              <section className="route-section expected-result">
                <div className="route-section-heading"><div><p className="overline">{germanRuns(tr("Шаг"))} {providerMode ? "5" : "4"}</p><h2>{germanRuns(tr("Подтвердите результат"))}</h2></div></div>
                <p className="result-optional-note">{germanRuns(tr("Этот шаг нужен, если вы уже действуете на официальном сайте. Если проходите тест, пропустите его и перейдите к оценке маршрута ниже."))}</p>
                <ul>{selectedMethod.expectedResult.map((item) => <li key={item}><CheckIcon /><span>{germanRuns(explainTerms(item))}</span></li>)}</ul>
                <div className="outcome-picker outcome-picker-five" role="group" aria-label={tr("Статус результата")}><button className={outcome === "waiting" ? "selected" : ""} type="button" onClick={() => setRouteOutcome("waiting")}>{germanRuns(tr("Отправлено, ожидаю"))}</button><button className={outcome === "received" ? "selected" : ""} type="button" disabled={doneSteps.length !== selectedMethod.steps.length} onClick={() => setRouteOutcome("received")}>{germanRuns(tr("Результат получен"))}</button><button className={outcome === "additional" ? "selected" : ""} type="button" onClick={() => setRouteOutcome("additional")}>{germanRuns(tr("Нужен документ"))}</button><button className={outcome === "refused" ? "selected" : ""} type="button" onClick={() => setRouteOutcome("refused")}>{germanRuns(tr("Отказ / не приняли"))}</button><button className={outcome === "blocked" ? "selected" : ""} type="button" onClick={() => setRouteOutcome("blocked")}>{germanRuns(tr("Другая проблема"))}</button></div>
                {doneSteps.length !== selectedMethod.steps.length && <small className="local-save-note">{germanRuns(tr("Чтобы отметить результат полученным, сначала завершите все этапы."))}</small>}
              </section>

              {outcome === "received" && <><div className="goal-state success"><CheckIcon /><div><b>{germanRuns(tr("Цель достигнута"))}</b><p>{germanRuns(explainTerms(config.successText))}</p>{config.nextRoute && <Link className="official-secondary" href={config.nextRoute.href}>{germanRuns(explainTerms(config.nextRoute.label))}</Link>}</div></div><ShareAfterRoute /></>}
              {outcome === "waiting" && <div className="goal-state waiting"><span>···</span><div><b>{germanRuns(tr("Результат ожидается"))}</b><p>{germanRuns(explainTerms(selectedMethod.processingTime))}  {germanRuns(tr("Сохраните официальное подтверждение подачи или записи."))}</p></div></div>}
              {(outcome === "additional" || outcome === "blocked" || outcome === "refused") && <div className="fallback-box route-fallback"><b>{outcome === "additional" ? tr("Запросили дополнительный документ") : outcome === "refused" ? tr("Получите причину и вернитесь к официальным требованиям") : tr("Официальный запасной путь")}</b>{outcome === "refused" && <p>{germanRuns(tr("Попросите зафиксировать, какое требование или документ не выполнены. Не заменяйте официальный ответ устным пересказом посредника и проверяйте следующий шаг только по официальной странице."))}</p>}<ul>{selectedMethod.fallback.map((item) => <li key={item}>{germanRuns(explainTerms(item))}</li>)}</ul><EvidenceLinks ids={[...config.fallbackSourceIds]} sources={sources} /></div>}

              <details className="route-section route-summary-export print-summary" id="personal-summary">
                <summary>{germanRuns(tr("Сохранить личную сводку маршрута"))}</summary>
                <p>{germanRuns(tr("В сводку входят выбранный способ, этапы, их статусы и официальные ссылки. Ответы на вопросы и персональные данные не включаются."))}</p>
                <pre>{summaryText()}</pre>
                <div className="summary-actions"><button type="button" onClick={printSummary}>{germanRuns(tr("Печать / сохранить PDF"))}</button><button type="button" onClick={() => void copySummary()}>{copied ? tr("Скопировано") : tr("Скопировать текст")}</button><button type="button" onClick={downloadSummary}>{germanRuns(tr("Скачать .txt"))}</button></div>
              </details>

              <details className="route-section route-evaluation" id="route-evaluation" open>
                <summary>{germanRuns(tr("Оценить понятность маршрута · 1 минута"))}</summary>
                <p className="evaluation-intro">{germanRuns(tr("Ответы помогают понять, можно ли пройти путь без платного посредника. NOSTRES не отправляет выбранные вами ответы на вопросы маршрута и не просит имя или email."))}</p>

                <fieldset className="evaluation-field">
                  <legend>{germanRuns(tr("Насколько понятным был маршрут?"))}</legend>
                  <div className="rating-buttons" role="group" aria-label={tr("Оценка понятности от 1 до 5")}>
                    {[1, 2, 3, 4, 5].map((rating) => <button className={feedbackClarity === rating ? "selected" : ""} type="button" key={rating} onClick={() => { setFeedbackClarity(rating); setRouteFeedbackStatus("idle"); }} aria-label={trf("{n} из 5", { n: rating })}>{rating}</button>)}
                  </div>
                  <div className="rating-caption"><span>{germanRuns(tr("Непонятно"))}</span><span>{germanRuns(tr("Полностью понятно"))}</span></div>
                </fieldset>

                <fieldset className="evaluation-field">
                  <legend>{germanRuns(tr("После NOSTRES понятно, что делать дальше?"))}</legend>
                  <div className="evaluation-options">{[["yes", "Да"], ["partly", "Частично"], ["no", "Нет"]].map(([value, label]) => <button className={feedbackNextAction === value ? "selected" : ""} type="button" key={value} onClick={() => { setFeedbackNextAction(value); setRouteFeedbackStatus("idle"); }}>{germanRuns(tr(label))}</button>)}</div>
                </fieldset>

                <fieldset className="evaluation-field">
                  <legend>{germanRuns(tr("Удалось перейти к нужному официальному действию?"))}</legend>
                  <div className="evaluation-options">{[["reached", "Да, перешёл"], ["not_yet", "Ещё не пробовал"], ["blocked", "Нет, возникла проблема"]].map(([value, label]) => <button className={feedbackOfficialAction === value ? "selected" : ""} type="button" key={value} onClick={() => { setFeedbackOfficialAction(value); setRouteFeedbackStatus("idle"); }}>{germanRuns(tr(label))}</button>)}</div>
                </fieldset>

                <label className="evaluation-select"><span>{germanRuns(tr("Что сильнее всего мешало?"))}</span><select value={feedbackBlocker} onChange={(event) => { setFeedbackBlocker(event.target.value); setRouteFeedbackStatus("idle"); }}>{blockerOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
                <button className="primary-action" type="button" disabled={!feedbackClarity || !feedbackNextAction || !feedbackOfficialAction || routeFeedbackStatus === "sending" || routeFeedbackStatus === "sent"} onClick={() => void submitRouteFeedback()}>{routeFeedbackStatus === "sending" ? tr("Сохраняем…") : routeFeedbackStatus === "sent" ? tr("Спасибо, оценка сохранена") : tr("Отправить анонимную оценку")}</button>
                {routeFeedbackStatus === "error" && <p className="feedback-error">{germanRuns(tr("Оценка сейчас не сохранилась. Попробуйте отправить ещё раз: ответы останутся на экране."))}</p>}
                {routeFeedbackStatus === "sent" && <p className="feedback-success">{germanRuns(tr("Готово. В оценку не вошли персональные данные и ответы на вопросы маршрута."))}</p>}
              </details>
            </div>
          )}

          {routeIsReady && <ChannelMatrix id={journeyId} />}

          {routeIsReady && <HearingAccess routeId={journey.id} />}
          {routeIsReady && <details className="route-section route-sources" id="official-sources">
            <summary>{germanRuns(tr("Все официальные источники и даты проверки"))} <span>{journey.sources.length}</span></summary>
            <p className="sources-intro">{germanRuns(tr("Каждый практический вывод выше связан с одной из этих страниц. Дата показывает последнюю ручную проверку источника, а не дату изменения закона."))}</p>
            <div className="route-source-list">
              {journey.sources.map((source, index) => <div className="route-source-row" key={source.url}><a href={lh(source.url)} target="_blank" rel="noreferrer" onClick={() => recordEvent("official_source_opened", { elementId: source.id })}><span className="source-number">{String(index + 1).padStart(2, "0")}</span><span><b>{germanRuns(explainTerms(source.label))}</b><small>{source.organization} · {source.scope}</small>{source.evidence && <p>{germanRuns(explainTerms(source.evidence))}</p>}<em>{germanRuns(tr("Проверено"))} {source.checkedAt}</em></span><ExternalIcon /></a><button type="button" onClick={() => openReport(source.id ?? source.url)}>{germanRuns(tr("Сообщить об ошибке"))}</button></div>)}
            </div>

            <div className="feedback-panel" id="report-source" tabIndex={-1}>
              <div><span className="feedback-mark">!</span><div><b>{germanRuns(tr("Сообщить об ошибке в официальной информации"))}</b><p>{germanRuns(tr("NOSTRES отправит только источник и тип проблемы. Ответы маршрута, документы, имя и email не передаются."))}</p></div></div>
              <label><span>{germanRuns(tr("Источник"))}</span><select value={reportSourceId} onChange={(event) => { setReportSourceId(event.target.value); setReportStatus("idle"); }}><option value="">{tr("Выберите источник")}</option>{journey.sources.map((source) => <option value={source.id ?? source.url} key={source.url}>{source.label}</option>)}</select></label>
              <label><span>{germanRuns(tr("Что не так"))}</span><select value={reportIssueType} onChange={(event) => { setReportIssueType(event.target.value); setReportStatus("idle"); }}>{issueTypes.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
              <button className="primary-action" type="button" disabled={!reportSourceId || reportStatus === "sending" || reportStatus === "sent"} onClick={() => void submitIssueReport()}>{reportStatus === "sending" ? tr("Отправляем…") : reportStatus === "sent" ? tr("Сообщение отправлено") : tr("Отправить без персональных данных")}</button>
              {reportStatus === "error" && <p className="feedback-error">{germanRuns(tr("Сейчас сообщение не сохранилось. Попробуйте ещё раз позже: введённые данные не потеряны."))}</p>}
              {reportStatus === "sent" && <p className="feedback-success">{germanRuns(tr("Источник добавлен в очередь ручной проверки."))}</p>}
            </div>
          </details>}

          {questionnaireSubmitted && <p className="disclaimer route-disclaimer">{germanRuns(tr("NOSTRES объясняет подтверждённый официальный путь, но не принимает решение за ведомство. Перед отправкой ещё раз проверьте актуальные условия на открытой официальной странице."))}</p>}
        </div>
      </div>
    </main>
  );
}
