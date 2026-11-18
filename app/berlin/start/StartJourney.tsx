"use client";

import { useEffect, useRef, useState } from "react";
import Link from "../../i18n/link";
import { channelFor, makePlan, type PlanItem, type StartingAnswers } from "./plan";
import { nextStep, waiting } from "./next-step";
import { readRouteProgress } from "../../progress-storage";
import { loadStartProgress, saveStartProgress } from "./progress-storage";
import { tr, trDeep, trf, useLocale, lh } from "../../i18n/store";
import ShareButton from "../../ShareButton";
import HeaderTools from "../../i18n/HeaderTools";
type Answers = Partial<StartingAnswers>;
type RouteState = Record<string, { outcome?: string }>;

const sourceLinks: Record<string, { href: string; title: string }> = {
  anmeldung: { href: "https://service.berlin.de/dienstleistung/120686/", title: "Берлин: регистрация адреса" },
  "address-check": { href: "https://service.berlin.de/dienstleistung/120686/", title: "Берлин: регистрация адреса" },
  "tax-id": { href: "https://service.berlin.de/dienstleistung/329123/", title: "Берлин: получение Steuer-ID" },
  health: { href: "https://gesund.bund.de/krankenversicherung", title: "Федеральный портал здоровья: страхование" },
  lea: { href: "https://www.berlin.de/einwanderung/termine/unsere-dienstleistungen/artikel.873508.php", title: "LEA: онлайн-услуги и контакты" },
  "permit-check": { href: "https://www.berlin.de/einwanderung/aufenthalt/", title: "LEA: пребывание в Германии" },
  housing: { href: "https://willkommenszentrum.berlin.de/wohnen/wohnungssuche", title: "Берлинский центр приветствия: поиск жилья" },
  doctor: { href: "https://gesund.bund.de/arztwahl-und-terminsuche", title: "Федеральный портал здоровья: поиск врача" },
  bank: { href: "https://www.bafin.de/DE/verbraucherinnen-verbraucher/themen-finanzprodukte/konten-zahlungen/konten/basiskonto/basiskonto_node.html", title: "BaFin: банковский счёт" },
  telecom: { href: "https://www.bundesnetzagentur.de/DE/Vportal/TK/InternetTelefon/Vertrag/start.html", title: "Bundesnetzagentur: права потребителя" },
  business: { href: "https://service.berlin.de/dienstleistung/121921/", title: "Берлин: регистрация предпринимательской деятельности" },
  "family-arrival": { href: "https://www.auswaertiges-amt.de/de/service/fragenkatalog-node/606772-606772", title: "МИД Германии: воссоединение семьи" },
  kita: { href: "https://service.berlin.de/dienstleistung/324873/", title: "Берлин: ваучер для детского сада" },
  school: { href: "https://willkommenszentrum.berlin.de/familie/schulen", title: "Берлин: школы" },
  dog: { href: "https://service.berlin.de/dienstleistung/330785/", title: "Берлин: реестр собак" },
  "dog-insurance": { href: "https://www.berlin.de/sen/verbraucherschutz/aufgaben/hundehaltung/artikel.1485419.php", title: "Берлин: ответственность владельца собаки" },
  "car-insurance": { href: "https://service.berlin.de/dienstleistung/120882/", title: "Берлин: регистрация автомобиля" },
  "professional-insurance": { href: "https://www.existenzgruendungsportal.de/Redaktion/DE/BMWK-Infopool/Antworten/Gruendungsplanung/Agentur-fuer-haushaltsnahe-Dienstleistungen-Betriebshaftpflicht-oder-Berufshaftpflichtversicherung", title: "Федеральный портал: ответственность по профессии" },
  "pension-self": { href: "https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Arbeitnehmer-und-Selbststaendige/03_Selbststaendige/selbststaendige_node", title: "Пенсионная служба: самозанятые" },
  "employee-social": { href: "https://www.make-it-in-germany.com/en/arriving-living/long-term/back-to-germany", title: "Официальный портал: социальное страхование на работе" },
  "work-status": { href: "https://www.bmas.de/DE/Soziales/Sozialversicherung/sozialversicherung-art.html", title: "Федеральное министерство труда: социальное страхование" },
};

function Question({ title, name, value, options, onChange }: { title: string; name: string; value?: string; options: [string, string][]; onChange: (value: string) => void }) {
  return <fieldset className="start-question"><legend>{title}</legend><div className="start-options">{options.map(([id, label]) => <label key={id} className={value === id ? "selected" : ""}><input type="radio" name={name} value={id} checked={value === id} onChange={() => onChange(id)} /><span>{tr(label)}</span></label>)}</div></fieldset>;
}

function isReady(a: Answers, stage: number) {
  if (stage === 0) return Boolean(a.location && a.housing && a.registered);
  if (stage === 1) return Boolean(a.family && a.children && a.dog && (!a.children || a.children === "none" || ((a.children !== "under6" && a.children !== "both" || a.kita) && (a.children !== "school" && a.children !== "both" || a.school))) && (a.dog === "none" || a.dogInsurance));
  if (stage === 2) return Boolean(a.taxId && a.insurance && a.permit && a.car && a.work && (a.work !== "employee" || a.employeeCoverage) && ((a.family === "none" && a.children === "none") || a.familyInsurance));
  return Boolean(a.access && a.eid && a.visit);
}

export default function StartJourney() {
  useLocale();
  const [answers, setAnswers] = useState<Answers>({ doctor: false, business: false, bank: false, telecom: false });
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<PlanItem[] | null>(null);
  const [routes, setRoutes] = useState<RouteState>({});
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const saved = loadStartProgress();
      if (saved?.answers && saved.answers.location) {
        setAnswers(saved.answers);
        setConfirmed(saved.confirmed);
        setStage(saved.stage);
        if (isReady(saved.answers, 0) && isReady(saved.answers, 1) && isReady(saved.answers, 2) && isReady(saved.answers, 3)) setResult(makePlan(saved.answers as StartingAnswers));
      }
    }, 0);
    const loadRoutes = () => {
      try { setRoutes(JSON.parse(readRouteProgress() || "{}") as RouteState); }
      catch { setRoutes({}); }
    };
    loadRoutes();
    window.addEventListener("focus", loadRoutes);
    return () => { window.clearTimeout(restore); window.removeEventListener("focus", loadRoutes); };
  }, []);

  function persistDraft(nextAnswers: Answers, nextStage: number, nextConfirmed = confirmed) {
    saveStartProgress({ answers: nextAnswers, stage: nextStage, confirmed: nextConfirmed });
  }

  function change<K extends keyof StartingAnswers>(field: K, value: StartingAnswers[K]) {
    setAnswers((current) => {
      const next = { ...current, [field]: value };
      persistDraft(next, stage);
      return next;
    });
  }
  function move(next: number) {
    persistDraft(answers, next);
    setStage(next);
    window.scrollTo({ top: 0, behavior: "instant" });
    window.setTimeout(() => titleRef.current?.focus(), 0);
  }
  function showPlan() {
    if (!isReady(answers, 3)) return;
    const full = { ...answers, doctor: Boolean(answers.doctor), business: Boolean(answers.business), bank: Boolean(answers.bank), telecom: Boolean(answers.telecom) } as StartingAnswers;
    setResult(makePlan(full));
    persistDraft(full, stage, confirmed);
    window.scrollTo({ top: 0, behavior: "instant" });
    window.setTimeout(() => titleRef.current?.focus(), 0);
  }
  function editPlan() {
    setResult(null);
    move(0);
  }
  function confirmDirect(id: string) {
    const next = confirmed.includes(id) ? confirmed.filter((existing) => existing !== id) : [...confirmed, id];
    setConfirmed(next);
    persistDraft(answers, stage, next);
  }
  const isDone = (item: PlanItem) => item.steps ? confirmed.includes(item.id) : (routes[item.id]?.outcome === "received" || (item.id === "housing" && routes[item.id]?.outcome === "ready"));
  const shown = result ? trDeep(result) : null;
  const next = shown ? nextStep(shown, isDone) : null;
  const queued = shown ? waiting(shown, isDone) : [];
  const finished = shown?.filter((item) => item.steps ? confirmed.includes(item.id) : (routes[item.id]?.outcome === "received" || (item.id === "housing" && routes[item.id]?.outcome === "ready"))).length ?? 0;

  return <main className="start-page" id="top" tabIndex={-1}>
    <header className="route-page-header"><Link className="brand" href="/" aria-label={tr("NOSTRES — на главную")}><span className="brand-mark" aria-hidden="true">N</span><span className="brand-copy"><b>NOSTRES</b><small>{tr("Понятный путь")}</small></span></Link><Link className="start-back" href="/">{tr("Все маршруты")}</Link><HeaderTools /></header>
    <div className="start-shell">
      <p className="overline">{tr("NOSTRES · Берлин · первая версия плана")}</p>
      <h1 ref={titleRef} tabIndex={-1}>{shown ? tr("Ваш план действий") : tr("С чего начать в Берлине")}</h1>
      {!shown ? <>
        <p className="start-lede">{tr("Сначала разберёмся, что у вас уже есть. Затем покажем список дел по порядку. Ответы сохраняются только на этом устройстве.")}</p>
        <div className="start-stage" role="status" aria-live="polite" aria-atomic="true" aria-label={trf("Часть {n} из 4", { n: stage + 1 })}><span>{tr("Часть")} {stage + 1}  {tr("из 4")}</span><div aria-hidden="true"><span style={{ width: `${(stage + 1) * 25}%` }} /></div></div>
        <div className="start-form">
          {stage === 0 && <>
            <h2>{tr("Где вы сейчас и что с адресом?")}</h2>
            <Question name="location" title={tr("Вы уже в Берлине?")} value={answers.location} options={[["already", "Да, живу здесь"], ["moving", "Планирую переезд в Берлин"], ["elsewhere", "Пока живу в другом городе"]]} onChange={(v) => change("location", v as StartingAnswers["location"])} />
            <Question name="housing" title={tr("Какая ситуация с жильём в Берлине?")} value={answers.housing} options={[["search", "Ищу жильё для переезда"], ["moved", "Уже въехал(а) в жильё"], ["settled", "Есть жильё, давно проживаю"], ["unsure", "Не знаю, подходит ли мой адрес"]]} onChange={(v) => change("housing", v as StartingAnswers["housing"])} />
            <Question name="registered" title={tr("Адрес уже зарегистрирован?")} value={answers.registered} options={[["berlin", "Да, нынешний адрес в Берлине"], ["elsewhere", "Да, но в другом городе или по другому адресу"], ["no", "Нет"], ["unsure", "Не уверен(а)"]]} onChange={(v) => change("registered", v as StartingAnswers["registered"])} />
          </>}
          {stage === 1 && <>
            <h2>{tr("Кто переезжает с вами?")}</h2>
            <Question name="family" title={tr("Ваша семья")} value={answers.family} options={[["none", "Переезжаю один/одна"], ["together", "Семья со мной"], ["joining", "Член семьи присоединится позже"]]} onChange={(v) => change("family", v as StartingAnswers["family"])} />
            <Question name="children" title={tr("Есть дети, для которых в Берлине нужны детский сад или школа?")} value={answers.children} options={[["none", "Нет"], ["under6", "Нужен детский сад"], ["school", "Нужна школа"], ["both", "Нужны и детский сад, и школа"]]} onChange={(v) => change("children", v as StartingAnswers["children"])} />
            {(answers.children === "under6" || answers.children === "both") && <Question name="kita" title={tr("Место в детском саду и ваучер уже оформлены?")} value={answers.kita} options={[["arranged", "Да"], ["need", "Нет"], ["unsure", "Не уверен(а)"]]} onChange={(v) => change("kita", v as StartingAnswers["kita"])} />}
            {(answers.children === "school" || answers.children === "both") && <Question name="school" title={tr("Зачисление в школу уже подтверждено?")} value={answers.school} options={[["arranged", "Да"], ["need", "Нет"], ["unsure", "Не уверен(а)"]]} onChange={(v) => change("school", v as StartingAnswers["school"])} />}
            <Question name="dog" title={tr("С вами собака?")} value={answers.dog} options={[["none", "Нет"], ["unregistered", "Да, уже в Берлине, но не в реестре"], ["registered", "Да, внесена в берлинский реестр"], ["moving", "Да, переезжает со мной"], ["unsure", "Да, не знаю насчёт реестра"]]} onChange={(v) => change("dog", v as StartingAnswers["dog"])} />
            {answers.dog && answers.dog !== "none" && <Question name="dogInsurance" title={tr("Есть страховка ответственности владельца собаки, действующая в Берлине?")} value={answers.dogInsurance} options={[["yes", "Да"], ["no", "Нет"], ["unsure", "Не уверен(а)"]]} onChange={(v) => change("dogInsurance", v as StartingAnswers["dogInsurance"])} />}
          </>}
          {stage === 2 && <>
            <h2>{tr("Документы, здоровье и цели")}</h2>
            <Question name="taxId" title={tr("Есть ли у вас налоговый идентификатор (Steuer-ID)?")} value={answers.taxId} options={[["yes", "Да"], ["no", "Нет"], ["unsure", "Не уверен(а)"]]} onChange={(v) => change("taxId", v as StartingAnswers["taxId"])} />
            <Question name="insurance" title={tr("Есть ли действующая медицинская страховка в Германии?")} value={answers.insurance} options={[["yes", "Да"], ["no", "Нет"], ["unsure", "Не уверен(а)"]]} onChange={(v) => change("insurance", v as StartingAnswers["insurance"])} />
            {(answers.family !== "none" || answers.children !== "none") && <Question name="familyInsurance" title={tr("Подтверждено ли медицинское покрытие для каждого члена семьи, включая детей?")} value={answers.familyInsurance} options={[["yes", "Да, у каждого"], ["no", "Нет"], ["unsure", "Не уверен(а)"]]} onChange={(v) => change("familyInsurance", v as StartingAnswers["familyInsurance"])} />}
            <Question name="car" title={tr("Нужно ли вам регистрировать автомобиль в Берлине?")} value={answers.car} options={[["none", "Автомобиля нет или регистрация не требуется"], ["covered", "Да, страховка и регистрация оформлены"], ["need", "Да, ещё нужен полис и номер eVB"], ["unsure", "Есть автомобиль, не знаю что требуется"]]} onChange={(v) => change("car", v as StartingAnswers["car"])} />
            <Question name="work" title={tr("Какой вариант описывает вашу работу сейчас?")} value={answers.work} options={[["employee", "Работаю по трудовому договору"], ["self", "Работаю самостоятельно"], ["other", "Не работаю или учусь"], ["unsure", "Не знаю, как оформлена работа"]]} onChange={(v) => change("work", v as StartingAnswers["work"])} />
            {answers.work === "employee" && <Question name="employeeCoverage" title={tr("Подтверждены ли регистрация и социальные взносы по этой работе?")} value={answers.employeeCoverage} options={[["yes", "Да, есть подтверждение"], ["no", "Нет"], ["unsure", "Не уверен(а)"]]} onChange={(v) => change("employeeCoverage", v as StartingAnswers["employeeCoverage"])} />}
            <Question name="permit" title={tr("Нужно ли продлить ваш документ о проживании?")} value={answers.permit} options={[["renew", "Да, документ заканчивается"], ["no", "Нет или это ко мне не относится"], ["unsure", "Не знаю"]]} onChange={(v) => change("permit", v as StartingAnswers["permit"])} />
            <fieldset className="start-question"><legend>{tr("Что ещё хотите сделать? Можно выбрать несколько пунктов.")}</legend><div className="start-options"><label className={answers.doctor ? "selected" : ""}><input type="checkbox" checked={Boolean(answers.doctor)} onChange={(e) => change("doctor", e.target.checked)} /><span>{tr("Найти врача")}</span></label><label className={answers.business ? "selected" : ""}><input type="checkbox" checked={Boolean(answers.business)} onChange={(e) => change("business", e.target.checked)} /><span>{tr("Начать самостоятельную работу")}</span></label><label className={answers.bank ? "selected" : ""}><input type="checkbox" checked={Boolean(answers.bank)} onChange={(e) => change("bank", e.target.checked)} /><span>{tr("Открыть банковский счёт")}</span></label><label className={answers.telecom ? "selected" : ""}><input type="checkbox" checked={Boolean(answers.telecom)} onChange={(e) => change("telecom", e.target.checked)} /><span>{tr("Оформить мобильную связь или интернет")}</span></label></div></fieldset>
          </>}
          {stage === 3 && <>
            <h2>{tr("Как вам удобнее действовать?")}</h2>
            <p>{tr("Способ зависит от правил конкретной услуги. Здесь мы учтём ваши возможности, а внутри каждого маршрута проверим условия.")}</p>
            <Question name="access" title={tr("Какой способ предпочитаете?")} value={answers.access} options={[["online", "По возможности онлайн"], ["office", "Лично в ведомстве"], ["either", "Оба подходят"]]} onChange={(v) => change("access", v as StartingAnswers["access"])} />
            <Question name="eid" title={tr("Есть ли подходящий документ с активной функцией онлайн-идентификации (eID) и PIN-кодом?")} value={answers.eid} options={[["ready", "Да, всё работает"], ["no", "Нет"], ["unsure", "Не знаю"]]} onChange={(v) => change("eid", v as StartingAnswers["eid"])} />
            <Question name="visit" title={tr("Можете ли вы прийти в ведомство лично?")} value={answers.visit} options={[["yes", "Да"], ["difficult", "Сложно"], ["no", "Нет"]]} onChange={(v) => change("visit", v as StartingAnswers["visit"])} />
            <fieldset className="start-question"><legend>{tr("Дополнительное предпочтение")}</legend><label className={`start-check-option ${answers.noPhone ? "selected" : ""}`}><input type="checkbox" checked={Boolean(answers.noPhone)} onChange={(event) => change("noPhone", event.target.checked)} /><span>{tr("Предпочитаю общаться письменно, без телефонных звонков")}</span></label></fieldset>
            <p className="start-help">{tr("Не нужно объяснять причину. Если услуга требует визита, маршрут покажет подтверждённые способы помощи и официальные контакты.")}</p>
          </>}
          <div className="start-actions">{stage > 0 && <button type="button" className="start-secondary" onClick={() => move(stage - 1)}>{tr("Назад")}</button>}<button type="button" className="primary-action" disabled={!isReady(answers, stage)} onClick={() => stage === 3 ? showPlan() : move(stage + 1)}>{stage === 3 ? tr("Получить список дел") : tr("Продолжить")}</button></div>
        </div>
      </> : <>
        <p className="start-lede">{tr("Это план по вашим ответам, а не автоматическое решение ведомства. Проверяйте применимость и документы в каждом официальном маршруте.")}</p>
        <div className="start-result-actions"><button type="button" className="start-secondary" onClick={editPlan}>{tr("Изменить ответы")}</button><button type="button" className="start-secondary" onClick={() => window.print()}>{tr("Распечатать список")}</button><ShareButton variant="text" path="/berlin/start" /></div>
        <p className="start-count" aria-live="polite">{shown.length ? trf("Дел в списке: {total}. Отмечено завершёнными в маршрутах: {done}.", { total: shown.length, done: finished }) : tr("По этим ответам новых дел среди маршрутов MVP не найдено.")}</p>
        {shown.length > 0 && (next
          ? <aside className="start-next" aria-labelledby="start-next-title"><p className="overline">{tr("Следующий шаг")}</p><h2 id="start-next-title">{next.title}</h2><p>{next.reason}</p>{next.href.startsWith("http") ? <a className="primary-action" href={lh(next.href)} target="_blank" rel="noreferrer">{tr("Открыть официальную страницу ↗")}</a> : <Link className="primary-action" href={next.href}>{tr("Открыть маршрут")}</Link>}</aside>
          : <aside className="start-next" aria-labelledby="start-next-title"><h2 id="start-next-title">{tr("Все доступные дела отмечены")}</h2><p>{tr("Если что-то изменится, обновите ответы и список пересоберётся.")}</p></aside>)}
        {queued.length > 0 && <aside className="start-waiting" aria-labelledby="start-waiting-title"><h2 id="start-waiting-title">{tr("Что ждёт предыдущего шага")}</h2><ul>{queued.map(({ item, blockedBy }) => <li key={item.id}><b>{item.title}</b>{tr(": сначала «")}{blockedBy.map((blocker) => blocker.title).join("», «")}»</li>)}</ul></aside>}
        <p className="start-preference"><b>{tr("Ваш выбор:")}</b> {answers.access === "online" ? tr("по возможности онлайн") : answers.access === "office" ? tr("личный приём в ведомстве") : tr("оба способа подходят")}{answers.noPhone ? tr("; письменно, без звонков") : ""}{tr(". Для каждого действия ниже указан фактический порядок; он может отличаться от предпочтения.")}</p>
        {(answers.visit === "no" || answers.visit === "difficult") && <div className="start-access-alert"><b>{tr("Посещение ведомства")} {answers.visit === "no" ? tr("невозможно") : tr("затруднено")}</b><p>{tr("Проверяйте по порядку: полностью дистанционный способ; частично дистанционную процедуру; подачу документов почтой; личную подачу через представителя; специальные условия обслуживания, если ведомство их официально предусматривает. Ни один способ не считается доступным, пока это не подтверждено для вашей услуги. Если подтверждённого пути нет, карточка объясняет ограничение и ведёт к официальной странице следующего действия. Причину ограничения сообщать не нужно.")}</p></div>}
        {shown.length ? <ol className="start-task-list">{shown.map((item, index) => {
          const done = item.steps ? confirmed.includes(item.id) : (routes[item.id]?.outcome === "received" || (item.id === "housing" && routes[item.id]?.outcome === "ready"));
          const official = sourceLinks[item.id];
          return <li className={done ? "done" : ""} key={item.id}><div className="start-task-top"><span className="start-number">{String(index + 1).padStart(2, "0")}</span><span className="start-sequence">{done ? tr("Результат отмечен") : item.sequence === "now" ? tr("Можно начать сейчас") : item.sequence === "after" ? tr("После указанного условия") : tr("Сначала определить")}</span></div><h2>{item.title}</h2><p>{item.reason}</p>{item.after && <p className="start-dependency"><b>{tr("Когда:")}</b> {item.after}</p>}<div className="start-channel"><b>{tr("Способ:")}</b> {tr(channelFor(item, answers as StartingAnswers))}<small>{item.note}</small></div>{item.steps && <details className="start-steps"><summary>{tr("Показать этапы и результат")}</summary><ol>{item.steps.map((step, i) => <li key={i}>{step}</li>)}</ol>{item.alternate && <a href={lh(item.alternate.href)} target="_blank" rel="noopener noreferrer">{item.alternate.label} ↗</a>}{item.confirmation && <p><b>{tr("Результат:")}</b> {item.confirmation}</p>}</details>}<div className="start-task-actions"><a className="primary-action" href={lh(item.href)} {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{item.steps ? tr("Перейти на официальный сайт →") : tr("Открыть маршрут и проверить способ →")}</a>{official && official.href !== item.href && <a className="start-official" href={lh(official.href)} target="_blank" rel="noopener noreferrer">{tr("Официальный источник:")} {tr(official.title)} ↗</a>}{item.id === "health" && <a className="start-official" href="https://gesund.bund.de/pflegeversicherung" target="_blank" rel="noopener noreferrer">{tr("Официальный источник: страхование ухода ↗")}</a>}{item.steps && item.confirmation && <button type="button" className="start-secondary" aria-pressed={done} onClick={() => confirmDirect(item.id)}>{done ? tr("Отменить отметку") : tr("Результат получен")}</button>}</div></li>;
        })}</ol> : <div className="start-access-alert"><p>{tr("Если вашей задачи здесь нет, откройте")} <Link href="/">{tr("все маршруты NOSTRES")}</Link>  {tr("или")} <a href="https://willkommenszentrum.berlin.de/" target="_blank" rel="noopener noreferrer">{tr("официальный центр приветствия Берлина ↗")}</a>.</p></div>}
        <aside className="start-help-banner"><b>{tr("Нужна помощь прямо сейчас?")}</b><p>{tr("Не ждите прохождения списка: при опасности для жизни звоните 112. Для срочной медицинской помощи без угрозы жизни откройте отдельный маршрут.")}</p><a href={lh("/berlin/srochnaya-pomoshch")}>{tr("Открыть срочную медицинскую помощь →")}</a></aside>
      </>}
    </div>
  </main>;
}
