import type { Action, Answers, Fact, Method, Plan, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

export const eventsOfficial = {
  careLimits: "https://www.bundesgesundheitsministerium.de/fileadmin/Dateien/3_Downloads/P/Pflegeversicherung_Leistungsbeitraege/Uebersicht_Leistungsbetraege_2026.pdf",
  careFlyer: "https://www.bundesgesundheitsministerium.de/service/publikationen/details/pflegebeduerftig-was-nun",
  careWay: "https://md-bund.de/fileadmin/dokumente/Publikationen/SPV/PDF_Grafik_Weg_zum_Pflegegrad/Der_Weg_zum_Pflegegrad_04.pdf",
  careBerlin: "https://www.berlin.de/sen/pflege/pflege-und-rehabilitation/pflege-zu-hause/pflege-kompakt-berlin-1415067.php",
  careLaw: "https://www.gesetze-im-internet.de/sgb_11/__33.html",
  careHelp: "https://www.berlin.de/ba-neukoelln/politik-und-verwaltung/aemter/amt-fuer-soziales/pflege/",
  disability: "https://service.berlin.de/dienstleistung/326173/",
  disabilityCard: "https://www.berlin.de/lageso/behinderung/schwerbehinderung-versorgungsamt/schwerbehindertenausweis/",
  equalisation: "https://www.arbeitsagentur.de/datei/doc_ba032315.pdf",
  register: "https://service.berlin.de/dienstleistung/120686/",
  landlord: "https://www.gesetze-im-internet.de/bmg/__19.html",
  broadcast: "https://www.rundfunkbeitrag.de/presse-und-aktuelles/servicethemen/worauf-muessen-sie-bei-einem-umzug-achten",
};
const e = eventsOfficial;

// ---------------------------------------------------------------------------
// Pflegegeld und Pflegegrad
// ---------------------------------------------------------------------------
export const careQuestions = [
  q("who", "Кому нужен уход?", [["self", "Мне самому"], ["relative", "Родственнику или близкому, которому я помогаю"], ["child", "Ребёнку младше 14 лет"]]),
  q("insurance", "Какая страховка у человека, которому нужен уход?", [["gkv", "Государственная (GKV)"], ["pkv", "Частная (PKV)"], ["none", "Страховки нет"]]),
  q("stage", "На каком вы этапе?", [["new", "Заявление ещё не подавали"], ["higher", "Pflegegrad есть, но уход стал тяжелее"], ["refused", "Получили отказ или Pflegegrad ниже ожидаемого"]]),
  q("years", "Был ли человек застрахован в Pflegeversicherung (страховке по уходу) не меньше двух лет за последние десять?", [["yes", "Да, два года или больше (в том числе семейная страховка)"], ["no", "Нет, меньше двух лет"]]),
  q("care", "Как будет организован уход?", [["family", "Ухаживают родные или близкие: Pflegegeld (деньги на руки)"], ["service", "Приходит Pflegedienst (служба ухода): Pflegesachleistung"], ["both", "И то и другое: Kombinationsleistung"]]),
] as const;

export function careVisible(a: Answers): readonly Question[] {
  const [who, insurance, stage, years, care] = careQuestions;
  if (a.insurance === "none") return [who, insurance];
  if (a.stage === "new") return a.years === "no" ? [who, insurance, stage, years] : [who, insurance, stage, years, care];
  return [who, insurance, stage, care];
}

export function carePlan(a: Answers): Plan {
  const limits = act("Bundesgesundheitsministerium: Leistungen 2026", e.careLimits);
  const flyer = act("Bundesgesundheitsministerium: Pflegebedürftig, was nun", e.careFlyer);
  const way = act("Medizinischer Dienst: Weg zum Pflegegrad", e.careWay);
  const berlin = act("Берлин: Pflege kompakt", e.careBerlin);
  const help = act("Берлин: Hilfe zur Pflege", e.careHelp);
  const law = act("Закон SGB XI, § 33", e.careLaw);
  const note = "Это общая информация, а не юридическая консультация. Суммы взяты из таблицы Bundesgesundheitsministerium на 2026 год; точную сумму после решения называет Pflegekasse.";
  const next = act("Маршрут: Krankenversicherung", "/berlin/health-insurance");
  const stuetzpunkt = step("Бесплатная консультация в Pflegestuetzpunkt", "В Берлине 36 Pflegestuetzpunkte (пунктов консультации по уходу). Консультация бесплатная и независимая, там помогают подготовиться к осмотру и к возражению. Центральный номер 0800 59 500 59, сайт pflegestuetzpunkteberlin.de.", "Звонок", berlin);
  if (a.insurance === "none") return {
    fit: "redirect",
    why: ["Нет медицинской страховки"],
    title: "Без страховки Pflegegeld не платят: помощь по уходу даёт Bezirksamt",
    summary: "Pflegegeld и Pflegegrad назначает страховка по уходу (Pflegeversicherung), поэтому без страховки их нет. Если расходов на уход не покрыть, можно подать заявление на Hilfe zur Pflege (помощь по уходу) в Amt für Soziales вашего района.",
    steps: [
      step("Подайте заявление на Hilfe zur Pflege", "Заявление подают в Amt für Soziales (отдел социальной помощи) района, где вы живёте. Страница района описывает порядок.", "Лично", help),
      stuetzpunkt,
      step("Оформите страховку", "Маршрут показывает, как получить медицинскую страховку и вместе с ней страховку по уходу.", "Онлайн", next, flyer),
    ],
    next,
    note,
  };
  const pkv = a.insurance === "pkv";
  const who = a.who === "child" ? "ребёнка" : a.who === "relative" ? "близкого человека" : "вас";
  if (a.stage === "new" && a.years === "no") return {
    fit: "redirect",
    why: [pkv ? "Частная страховка" : "Государственная страховка", "Меньше двух лет страхования по уходу"],
    title: "Пока нет права на Pflegegeld: нужны два года страхования",
    summary: "По закону Pflegeversicherung платит, если человек был застрахован по уходу не меньше двух лет за последние десять (членство или семейная страховка). Для детей достаточно, чтобы это условие выполнил один из родителей. Пока условие не выполнено, остаётся Hilfe zur Pflege.",
    steps: [
      step("Подайте заявление на Hilfe zur Pflege", "Заявление подают в Amt für Soziales района. Помощь не зависит от двух лет страхования, но учитывает доход и имущество.", "Лично", help, law),
      stuetzpunkt,
    ],
    next,
    note,
  };
  const amounts: Fact[] = a.care === "service"
    ? [{ label: "Pflegesachleistung в месяц, до", value: "Pflegegrad 2: 796 €, 3: 1.497 €, 4: 1.859 €, 5: 2.299 €. Деньги получает служба ухода напрямую", kind: "official" }]
    : a.care === "both"
      ? [{ label: "Kombinationsleistung", value: "Pflegegeld и Pflegesachleistung можно совмещать: сколько вы тратите на Pflegedienst, на столько Pflegegeld уменьшается пропорционально", kind: "official" }, { label: "Pflegegeld в месяц", value: "Pflegegrad 2: 347 €, 3: 599 €, 4: 800 €, 5: 990 €", kind: "official" }, { label: "Pflegesachleistung в месяц, до", value: "Pflegegrad 2: 796 €, 3: 1.497 €, 4: 1.859 €, 5: 2.299 €", kind: "official" }]
      : [{ label: "Pflegegeld в месяц", value: "Pflegegrad 2: 347 €, 3: 599 €, 4: 800 €, 5: 990 €. При Pflegegrad 1 Pflegegeld не платят", kind: "official" }];
  const always: Fact[] = [
    { label: "Entlastungsbetrag", value: "131 € в месяц при любом Pflegegrad, от 1 до 5, на услуги по разгрузке и уходу", kind: "official" },
    { label: "Verhinderungspflege и Kurzzeitpflege", value: "общий годовой лимит 3.539 € при Pflegegrad 2–5", kind: "official" },
  ];
  const apply = step(
    a.stage === "new" ? `Подайте заявление на Pflegegrad для ${who}` : a.stage === "higher" ? "Подайте заявление на повышение (Höherstufung)" : "Подайте возражение (Widerspruch) на решение",
    a.stage === "new"
      ? `Заявление подают в Pflegekasse (кассу по уходу при ${pkv ? "частной страховке: в частную страховую компанию" : "вашей больничной кассе"}). Достаточно звонка или письма. Для ${who} ${a.who === "self" ? "заявление подаёте вы" : "заявление может подать доверенное лицо, например родственник, по доверенности (Vollmacht)"}. Pflegegrad действует с месяца подачи заявления, поэтому не откладывайте.`
      : a.stage === "higher"
        ? "Новое заявление запускает проверку заново: пишете или звоните в ту же Pflegekasse. Назовите, что изменилось в состоянии и уходе. Повышение начинается с даты заявления."
        : "Возражение подают в Pflegekasse в течение одного месяца после получения решения (Leistungsbescheid). Нужно письмо с датой решения и просьбой пересмотреть; Medizinischer Dienst проверяет оценку заново, возможен повторный осмотр.",
    "Звонок", flyer, law);
  const consult = step("Получите консультацию Pflegekasse", "После заявления касса обязана предложить консультацию в течение двух недель. Закреплённый консультант приходит на дом по желанию, либо касса выдаёт Beratungsgutschein (талон на независимую консультацию).", "Выбор", flyer);
  const exam = step(a.who === "child" ? "Осмотр на дому: ребёнок младше 14 лет" : "Подготовьтесь к осмотру", a.who === "child" ? "Для детей младше 14 лет осмотр Medizinischer Dienst проходит дома. Подготовьте заключения врачей, последнюю выписку из больницы и анкету самооценки." : pkv ? "Осмотр для частно застрахованных проводит MEDICPROOF. Приходят домой; ухаживающий человек должен быть дома. Подготовьте заключения врачей и выписки из больницы." : "Осмотр проводит Medizinischer Dienst, обычно дома; ухаживающий человек должен быть при этом. Подготовьте заключения врачей, последнюю выписку из больницы и анкету самооценки.", "Лично", way, flyer);
  const decision = step("Дождитесь решения", "Pflegekasse выносит решение в течение 25 рабочих дней после заявления. В больнице, реабилитации или при паллиативной помощи осмотр проходит быстрее: в течение недели.", "Ожидание", way, flyer);
  const benefit = step("Выберите форму помощи", a.care === "family" ? "Pflegegeld платят на ваш счёт, пока уход обеспечивают родные или близкие. Суммы указаны в фактах метода." : a.care === "service" ? "Pflegesachleistung оплачивает службу ухода (Pflegedienst) напрямую в пределах лимита. Выберите службу, с которой Pflegekasse заключила договор." : "Можно совместить Pflegegeld и Pflegedienst: касса пересчитывает Pflegegeld пропорционально использованной Pflegesachleistung.", "Выбор", limits, berlin);
  const method: Method = {
    id: a.stage === "refused" ? "widerspruch" : "kasse",
    kind: a.stage === "refused" ? "mail" : "phone",
    title: a.stage === "refused" ? "Письменное возражение в Pflegekasse" : "Заявление в Pflegekasse",
    summary: a.stage === "refused" ? "Возражение нужно подать в течение месяца после решения." : "Заявление подаётся звонком или письмом, отдельной формы не требуется.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: [pkv ? "Заявление подаёт частная страховая компания человека" : "Заявление подаёт больничная касса человека, у неё есть Pflegekasse", "Человеку нужен постоянный уход, ожидаемый не меньше шести месяцев"],
    documents: a.stage === "refused" ? ["Решение Pflegekasse (Leistungsbescheid) с датой", "Письмо с возражением и подписью"] : ["Номер страховки и данные человека, которому нужен уход", "Заключения врачей и последняя выписка из больницы", ...(a.who === "relative" ? ["Доверенность (Vollmacht), если заявление подаёт родственник"] : [])],
    facts: [...amounts, ...always, { label: "Срок решения", value: "25 рабочих дней с заявления", kind: "official" }],
    steps: a.stage === "refused" ? [apply, exam, decision, stuetzpunkt, benefit] : [apply, consult, exam, decision, benefit, stuetzpunkt],
  };
  return {
    fit: "fits",
    why: [pkv ? "Частная страховка" : "Государственная страховка", a.stage === "new" ? "Заявление ещё не подавали" : a.stage === "higher" ? "Pflegegrad есть, уход стал тяжелее" : "Отказ или низкий Pflegegrad", `Уход для ${who}`, a.care === "service" ? "Pflegedienst" : a.care === "both" ? "Pflegegeld и Pflegedienst" : "Уход родными"],
    title: a.stage === "new" ? "Подайте заявление на Pflegegrad в Pflegekasse" : a.stage === "higher" ? "Подайте заявление на повышение Pflegegrad" : "Подайте возражение в течение одного месяца",
    summary: "Pflegegeld (деньги на уход родными) платят со второго Pflegegrad; при первом Pflegegrad есть только Entlastungsbetrag. Pflegegrad определяет Medizinischer Dienst по осмотру, решение принимает Pflegekasse.",
    methods: [method],
    singleMethodNote: "Способ один: заявление или возражение в Pflegekasse. Подавать его нужно именно туда, где человек застрахован.",
    steps: method.steps,
    next,
    note,
  };
}

// ---------------------------------------------------------------------------
// Schwerbehindertenausweis
// ---------------------------------------------------------------------------
export const disabilityQuestions = [
  q("stage", "На каком вы этапе?", [["new", "Заявление ещё не подавали"], ["waiting", "Подали, жду решения"], ["decided", "Есть решение с GdB"]]),
  q("status", "Ваш статус?", [["eu", "Гражданин Германии или ЕС"], ["noneu", "Гражданин третьей страны с видом на жительство"]]),
  q("who", "Кто подаёт заявление?", [["self", "Я сам"], ["rep", "Представитель или опекун"], ["minor", "Родитель за подростка от 15 лет"]]),
  q("sent", "Как подавалось заявление?", [["normal", "Обычным способом"], ["window", "Онлайн между 28 января и 28 апреля 2026 года, письменного подтверждения за 4 недели нет"]]),
  q("gdb", "Какой GdB в решении?", [["high", "50 или больше"], ["mid", "30 или 40"], ["low", "Меньше 30"]]),
] as const;

export function disabilityVisible(a: Answers): readonly Question[] {
  const [stage, status, who, sent, gdb] = disabilityQuestions;
  if (a.stage === "waiting") return [stage, sent];
  if (a.stage === "decided") return [stage, gdb];
  return [stage, status, who];
}

export function disabilityPlan(a: Answers): Plan {
  const form = act("Берлин: Feststellung einer Behinderung", e.disability);
  const card = act("LAGeSo: Schwerbehindertenausweis", e.disabilityCard);
  const equal = act("Bundesagentur: Gleichstellung", e.equalisation);
  const note = "Это общая информация, а не юридическая консультация. Условия взяты со страниц Берлина (LAGeSo) и Bundesagentur für Arbeit.";
  const next = act("Маршрут: Kindergeld", "/berlin/kindergeld");
  if (a.stage === "waiting") return {
    fit: "fits",
    why: ["Заявление подано", a.sent === "window" ? "Онлайн-подача в период технической неполадки" : "Обычная подача"],
    title: a.sent === "window" ? "Напишите в LAGeSo: заявление могло потеряться" : "Ждите решения и досылайте документы онлайн",
    summary: a.sent === "window" ? "Из-за технической неполадки между 28 января и 28 апреля 2026 года часть онлайн-заявлений могла пропасть. Если письменного подтверждения нет в течение 4 недель, нужно написать в LAGeSo; восстановить заявление нельзя, поэтому его придётся подать заново." : "Среднее время обработки 5–6 месяцев. Врачебные документы Versorgungsamt запрашивает у ваших врачей сам, недостающее можно загрузить онлайн.",
    steps: a.sent === "window" ? [
      step("Напишите в LAGeSo", "Письмо на infoservice@lageso.berlin.de: укажите дату онлайн-заявления и что письменного подтверждения не пришло.", "Онлайн", form),
      step("Подайте заявление заново, если его не нашли", "Заявления, которые невозможно восстановить, нужно подать заново: бумажное заявление отправляется по почте на Postfach 310929, 10639 Berlin. Маршрут выше показывает документы.", "Лично", form),
    ] : [
      step("Дождитесь Eingangsbestätigung", "С получением заявления начинается процедура, вы получаете письменное подтверждение. Versorgungsamt запрашивает документы у ваших врачей.", "Ожидание", form),
      step("Догрузите документы онлайн", "Недостающие документы (PDF) можно загрузить в сервисе «Nachreichung von Unterlagen». После загрузки приходит письмо на почту с номером транзакции.", "Онлайн", form),
      step("Получите Bescheid", "Решение называет GdB и Merkzeichen (отметки о правах). Среднее время 5–6 месяцев.", "Ожидание", form, card),
    ],
    next,
    note,
  };
  if (a.stage === "decided") {
    const high = a.gdb === "high";
    const mid = a.gdb === "mid";
    return {
      fit: high ? "fits" : mid ? "conditional" : "redirect",
      why: ["Решение с GdB", high ? "GdB 50 или больше" : mid ? "GdB 30 или 40" : "GdB меньше 30"],
      title: high ? "Получите Schwerbehindertenausweis и проверьте Merkzeichen" : mid ? "Подайте заявление на Gleichstellung в Agentur für Arbeit" : "Ausweis при GdB меньше 30 не выдаётся",
      summary: high ? "При GdB 50 или больше выдаётся Schwerbehindertenausweis, он действует по всей Германии. Merkzeichen в решении дают отдельные права, например G, aG, H, B, RF." : mid ? "При GdB 30 или 40 Ausweis не выдают, но можно подать заявление на Gleichstellung (приравнивание к тяжёлой инвалидности) в Agentur für Arbeit. Для этого нужна копия решения с GdB." : "При GdB меньше 30 ни Ausweis, ни Gleichstellung не положены. Если состояние ухудшилось, можно сообщить об изменении и подать новое заявление.",
      steps: high ? [
        step("Получите Ausweis", "Карточку присылают по PIN-Post, можно получить и лично в Kundencenter по записи. Единый зелёный Ausweis выдают при GdB 50 и больше.", "Выбор", card),
        step("Запросите бесплатный проезд, если он в решении", "Если в решении есть право на скидку или бесплатный местный транспорт, выдают зелёно-оранжевую карточку; Beiblatt с Wertmarke выдают по заявлению и он действует только вместе с карточкой.", "Выбор", card),
        step("Запросите многоязычную справку для поездок", "Versorgungsamt по заявлению выдаёт справку на нескольких языках о признании тяжёлой инвалидности по немецкому праву.", "Выбор", card),
      ] : mid ? [
        step("Подайте заявление на Gleichstellung", "Заявление в Agentur für Arbeit можно подать в свободной форме или онлайн в сервисе «Gleichstellungsantrag». Приложите копию решения с GdB.", "Онлайн", equal),
        step("Учтите защиту от увольнения", "Особая защита от увольнения действует, если Gleichstellung уже есть к моменту увольнения или заявление подано не позже чем за три недели до него.", "Выбор", equal),
      ] : [
        step("Сообщите об ухудшении", "Если состояние ухудшилось, в Берлине есть отдельная услуга «Schwerbehinderung: Änderung mitteilen» на service.berlin.de; она открывает пересмотр.", "Онлайн", form),
        step("Подайте новое заявление", "Если решение вынесено давно, подайте новое заявление по бумажной форме с новыми документами врачей.", "Лично", form),
      ],
      next: high ? act("Маршрут: Kindergeld", "/berlin/kindergeld") : mid ? act("Bundesagentur: Gleichstellung", e.equalisation) : act("Берлин: Änderung mitteilen", e.disability),
      note,
    };
  }
  const noneu = a.status === "noneu";
  const method: Method = {
    id: "mail", kind: "mail", title: "Бумажное заявление по почте", summary: "Онлайн-подача сейчас недоступна, первое заявление принимают только по почте.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Нарушение здоровья длится дольше 6 месяцев", "Участие в жизни затруднено, подтверждено документами врачей", "Заявление подают в LAGeSo, Versorgungsamt Berlin"],
    documents: ["Заявление на Feststellung einer Behinderung (бумажная форма)", noneu ? "Подтверждение статуса: цветная копия паспорта или Aufenthaltstitel" : "Копия Personalausweis с обеих сторон", "Steuer-ID", "Врачебные документы: Arztberichte, Befunde, выписки, заключения Jobcenter, Rentenversicherung или Medizinischer Dienst"],
    facts: [{ label: "Стоимость", value: "бесплатно", kind: "official" }, { label: "Срок", value: "в среднем 5–6 месяцев", kind: "official" }],
    steps: [
      step("Скачайте форму и чек-лист", "Форма и Ausfüllhilfe (пошаговая подсказка) лежат на странице Versorgungsamt. Помощь в заполнении дают Beratungsstelle в Gesundheitsamt вашего района.", "Выбор", form),
      step("Соберите копии документов", `${noneu ? "Подтверждение статуса: цветная копия паспорта или Aufenthaltstitel. " : "Копия Personalausweis с обеих сторон. "}Steuer-ID и врачебные документы (Befunde, без снимков). ${a.who === "rep" ? "Приложите Vollmacht или удостоверение опекуна. " : a.who === "minor" ? "Для подростка от 15 лет приложите подтверждение права опеки. " : ""}`.trim(), "Выбор", form),
      step("Отправьте по почте", "Адрес: Landesamt für Gesundheit und Soziales, Versorgungsamt, Postfach 310929, 10639 Berlin. Срок ответа: Eingangsbestätigung приходит с началом процедуры.", "Выбор", form),
      step("Догрузите недостающее онлайн", "Во время процедуры документы в PDF можно загрузить онлайн в сервисе «Nachreichung von Unterlagen».", "Онлайн", form),
    ],
  };
  return {
    fit: "fits",
    why: ["Заявление ещё не подано", noneu ? "Гражданин третьей страны" : "Гражданин Германии или ЕС", a.who === "rep" ? "Подаёт представитель" : a.who === "minor" ? "Подросток от 15 лет" : "Подаёт сам"],
    title: "Подайте заявление в Versorgungsamt по почте",
    summary: "Ausweis выдают при GdB от 50. Решение называет GdB и Merkzeichen. Онлайн-подача сейчас недоступна, первое заявление отправляют по почте.",
    methods: [method],
    singleMethodNote: "Способ один: онлайн-подача временно недоступна, первичное заявление принимают только по почте.",
    steps: method.steps,
    next,
    note: `${note} Какие права вид на жительство даёт для процедуры, страница LAGeSo не указывает: условие нужно только как подтверждение статуса.`,
  };
}

// ---------------------------------------------------------------------------
// Wohnungsgeberbestätigung
// ---------------------------------------------------------------------------
export const landlordQuestions = [
  q("role", "Кто вы?", [["tenant", "Арендатор, мне нужна Wohnungsgeberbestätigung"], ["owner", "Собственник, сдаю жильё"], ["agent", "Hausverwaltung (управляющая компания) от имени собственника"], ["main", "Главный арендатор, сдаю комнату"]]),
  q("state", "Что с подтверждением?", [["need", "Ещё не получил"], ["have", "Уже есть"], ["refused", "Арендодатель отказывает или тянет"]]),
  q("late", "Прошло ли больше двух недель после заселения?", [["no", "Нет"], ["yes", "Да"]]),
] as const;

export function landlordVisible(a: Answers): readonly Question[] {
  const [role, state, late] = landlordQuestions;
  if (a.role !== "tenant") return [role];
  if (a.state === "have") return [role, state];
  return [role, state, late];
}

export function landlordPlan(a: Answers): Plan {
  const reg = act("Берлин: Wohnsitz anmelden", e.register);
  const form = act("Закон: Wohnungsgeberbestätigung (§ 19 BMG)", e.landlord);
  const law = act("Закон BMG, § 19", "https://www.gesetze-im-internet.de/bmg/__19.html");
  const note = "Это общая информация, а не юридическая консультация. Условия взяты с официального описания услуги и страницы регистрации Берлина.";
  const next = act("Маршрут: Anmeldung", "/berlin/anmeldung");
  const content = "Что должно быть в подтверждении: имя и адрес арендодателя (если он не собственник, то и имя собственника), дата заселения, адрес жилья и имена всех, кто въехал и должен зарегистрироваться.";
  const penalty: Fact[] = [
    { label: "Срок выдачи", value: "в течение двух недель после заселения", kind: "official" },
    { label: "Штраф арендодателю", value: "до 1.000 € за невыданное, неверное или несвоевременное подтверждение", kind: "official" },
    { label: "Адрес без реального проживания", value: "предоставление адреса для регистрации без реального проживания: штраф до 50.000 €", kind: "official" },
  ];
  if (a.role !== "tenant") {
    const owner = a.role === "owner";
    const agent = a.role === "agent";
    return {
      fit: "fits",
      why: [owner ? "Собственник сдаёт жильё" : agent ? "Hausverwaltung" : "Главный арендатор сдаёт комнату"],
      title: "Выдайте Wohnungsgeberbestätigung в течение двух недель",
      summary: `${owner ? "Собственник" : agent ? "Управляющая компания действует от имени собственника, но в подтверждении указывают и собственника." : "Главный арендатор, сдающий комнату, тоже считается Wohnungsgeber и обязан выдать подтверждение."} Договор аренды подтверждение не заменяет.`,
      steps: [
        step("Заполните подтверждение", `${content} ${agent ? "Укажите себя как управляющего и отдельно имя собственника. " : ""}${a.role === "main" ? "Укажите себя как Wohnungsgeber; собственником будет ваш арендодатель. " : ""}Подпишите.`.trim(), "Выбор", form, law),
        step("Передайте его жильцу в срок", "Подтверждение нужно передать в течение двух недель после заселения. Где муниципалитет это поддерживает, можно подтвердить и электронно через Zuordnungsmerkmal (код привязки), который жилец укажет при регистрации.", "Выбор", form),
        step("Не выдавайте подтверждение без реального заселения", "Адрес для регистрации без реального проживания: штраф до 50.000 €. Невыданное или несвоевременное подтверждение: до 1.000 €.", "Выбор", form, law),
      ],
      next,
      note,
    };
  }
  const late = a.late === "yes";
  if (a.state === "have") return {
    fit: "fits",
    why: ["Арендатор", "Подтверждение уже есть"],
    title: "Проверьте подтверждение и идите на Anmeldung",
    summary: "С подтверждением можно регистрироваться в Bürgeramt или онлайн. Договор аренды подтверждение не заменяет, поэтому оно нужно при каждой регистрации.",
    steps: [
      step("Проверьте содержание", content, "Выбор", form),
      step("Зарегистрируйте адрес в течение 14 дней", "Регистрация бесплатна и нужна в течение 14 дней после заселения. Возьмите подтверждение и документ личности.", "Лично", reg, form),
    ],
    next,
    note,
  };
  const refused = a.state === "refused";
  const message = "Образец письма: «Guten Tag, ich bin am [Datum] in die Wohnung [Adresse] eingezogen. Bitte stellen Sie mir gemäß § 19 Bundesmeldegesetz die Wohnungsgeberbestätigung aus, spätestens innerhalb von zwei Wochen nach Einzug. Mit freundlichen Grüßen».";
  return {
    fit: refused || late ? "conditional" : "fits",
    why: ["Арендатор", refused ? "Арендодатель отказывает или тянет" : "Подтверждения ещё нет", late ? "Больше двух недель после заселения" : "Меньше двух недель после заселения"],
    title: refused ? "Сообщите в Meldebehörde, если арендодатель не выдаёт подтверждение" : "Попросите у арендодателя Wohnungsgeberbestätigung",
    summary: refused ? "Если арендодатель отказывается или вы не можете получить подтверждение вовремя, закон требует без промедления сообщить об этом в Meldebehörde (орган регистрации, в Берлине это Bürgeramt)." : "Арендодатель обязан выдать подтверждение в течение двух недель после заселения. Без него регистрация не проходит, договор аренды подтверждение не заменяет.",
    steps: [
      step("Напишите арендодателю", message, "Выбор", form, law),
      ...(refused || late ? [step("Сообщите в Bürgeramt", "Если арендодатель отказывает или срок вышел, сообщите об этом в Bürgeramt без промедления: регистрация идёт параллельно и срок 14 дней продолжает идти.", "Лично", reg, form)] : []),
      step("Зарегистрируйте адрес", "Регистрация бесплатна и нужна в течение 14 дней после заселения.", "Лично", reg, form),
    ],
    next,
    note: `${note} ${penalty.map((f) => `${f.label}: ${f.value}.`).join(" ")}`,
  };
}

// ---------------------------------------------------------------------------
// Umzug
// ---------------------------------------------------------------------------
export const moveQuestions = [
  q("from", "Откуда вы переезжаете?", [["berlin", "Из другой квартиры в Берлине"], ["germany", "Из другого города Германии"], ["abroad", "Из-за границы"]]),
  q("doc", "Какой у вас документ?", [["eid", "Personalausweis или eID-карта с включённой онлайн-функцией (гражданин Германии или ЕС)"], ["eat", "Aufenthaltstitel (электронный вид на жительство, eAT)"], ["other", "Другой документ"]]),
  q("household", "С кем переезжаете?", [["alone", "Один"], ["family", "С семьёй или детьми"]]),
  q("benefit", "Какие выплаты вы получаете?", [["none", "Никаких"], ["kindergeld", "Kindergeld"], ["jobcenter", "Бюргергельд или Grundsicherungsgeld в Jobcenter"], ["wohngeld", "Wohngeld"]]),
] as const;

export function moveVisible(a: Answers): readonly Question[] {
  const [from, doc, household, benefit] = moveQuestions;
  if (a.from === "abroad") return [from];
  return [from, doc, household, benefit];
}

export function movePlan(a: Answers): Plan {
  const reg = act("Берлин: Wohnsitz anmelden", e.register);
  const broadcast = act("Rundfunkbeitrag: переезд", e.broadcast);
  const landlord = act("Маршрут: Wohnungsgeberbestätigung", "/berlin/wohnungsgeber");
  const note = "Это общая информация, а не юридическая консультация. Условия взяты со страницы регистрации Берлина и официальной брошюры Rundfunkbeitrag.";
  if (a.from === "abroad") return {
    fit: "redirect",
    why: ["Переезд из-за границы"],
    title: "Из-за границы идёт первая регистрация, а не смена адреса",
    summary: "Для первого въезда есть отдельный маршрут: регистрация адреса в течение 14 дней после заселения с подтверждением от арендодателя.",
    steps: [step("Откройте маршрут «Регистрация адреса»", "Он показывает документы, подтверждение арендодателя и запись в Bürgeramt.", "Онлайн", act("Маршрут: Anmeldung", "/berlin/anmeldung"), reg)],
    next: act("Маршрут: Anmeldung", "/berlin/anmeldung"),
    note,
  };
  const eid = a.doc === "eid";
  const eat = a.doc === "eat";
  const family = a.household === "family";
  const berlin = a.from === "berlin";
  const online: Method = {
    id: "online", kind: "online", title: "Онлайн через BundID и AusweisApp", summary: "Для граждан Германии и ЕС старше 18 лет с онлайн-функцией удостоверения.",
    availability: eid ? "available" : "conditional", availabilityLabel: eid ? "Доступно" : "Нужен Personalausweis или eID",
    conditions: ["Возраст от 18 лет, гражданство Германии или ЕС", "С eAT онлайн-регистрация невозможна", family ? "Семью можно зарегистрировать онлайн; людей вне семьи нельзя" : "Только вы сами"],
    documents: ["BundID-аккаунт", "Personalausweis или eID-карта с включённой онлайн-функцией и PIN", "Кардридер или современный смартфон с приложением AusweisApp", "Wohnungsgeberbestätigung"],
    facts: [{ label: "Стоимость", value: "бесплатно", kind: "official" }, { label: "Срок регистрации", value: "в течение 14 дней после заселения", kind: "official" }],
    steps: [
      step("Подготовьте подтверждение арендодателя", "Без Wohnungsgeberbestätigung регистрация не пройдёт; договор аренды её не заменяет.", "Выбор", landlord, reg),
      step("Зарегистрируйте новый адрес онлайн", "Войдите через BundID с eID, заполните форму. После проверки цифровое подтверждение появится в сервисе, адрес на документе обновится через AusweisApp, а наклейка придёт по почте.", "Онлайн", reg),
    ],
  };
  const person: Method = {
    id: "buergeramt", kind: "in-person", title: "Лично в Bürgeramt по записи", summary: "Подходит всем, в том числе с eAT. Подтверждение выдают сразу.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Запись в Bürgeramt, регистрировать самостоятельно можно с 16 лет", family ? "Детей младше 16 лет регистрирует взрослый, к которому они переезжают; при раздельных родителях нужно согласие родителей с правом опеки" : "Вы регистрируетесь сами"],
    documents: ["Wohnungsgeberbestätigung", eat ? "Aufenthaltstitel (eAT)" : "Personalausweis или паспорт", "Заполненная форма регистрации", ...(family ? ["Свидетельства о браке и рождении при первой регистрации в Берлине"] : [])],
    facts: [{ label: "Стоимость", value: "бесплатно", kind: "official" }, { label: "Выдача подтверждения", value: "сразу на приёме", kind: "official" }],
    steps: [
      step("Подготовьте подтверждение арендодателя", "Арендодатель должен выдать его в течение двух недель после заселения.", "Выбор", landlord, reg),
      step("Запишитесь в Bürgeramt и придите на приём", "Запишитесь на странице услуги. Подтверждение регистрации выдают сразу.", "Лично", reg),
      step(eat ? "Адрес на eAT обновят сразу" : "Адрес на документе обновят сразу", eat ? "На приёме адрес в электронном виде на жительство вносят сразу; отдельного визита за новым адресом не нужно." : "Адрес на документе удостоверения обновляют в Bürgeramt сразу.", "Лично", reg),
    ],
  };
  const methods = eid ? [online, person] : [person];
  const after: Step[] = [];
  after.push(step("Обновите адрес в Rundfunkbeitrag", "Beitragsnummer (номер плательщика) личная и переезжает вместе с вами: сообщите новый адрес или зарегистрируйте новую квартиру онлайн на rundfunkbeitrag.de/formulare. Если съезжается пара, платит один человек, второй указывает его номер. Если вы платили по номеру человека, который съехал, платежи уйдут на его новый адрес и ваша квартира окажется в долге.", "Онлайн", broadcast));
  if (a.benefit === "kindergeld") after.push(step("Сообщите о переезде в Familienkasse", "Адрес в Kindergeld меняют вместе с другими изменениями: маршрут показывает, как сообщить.", "Онлайн", act("Маршрут: Kindergeld", "/berlin/kindergeld")));
  if (a.benefit === "jobcenter") after.push(step("Сообщите о переезде в Jobcenter", "Новый адрес и договор аренды отправьте в Jobcenter: маршрут показывает контакты и порядок.", "Онлайн", act("Маршрут: Jobcenter", "/berlin/jobcenter")));
  if (a.benefit === "wohngeld") after.push(step("Сообщите о переезде по Wohngeld", "Адрес и аренда изменились, и это влияет на расчёт: маршрут показывает, как подать заявление и что приложить.", "Онлайн", act("Маршрут: Wohngeld", "/berlin/wohngeld")));
  return {
    fit: "fits",
    why: [berlin ? "Переезд внутри Берлина" : "Переезд из другого города Германии", eid ? "Personalausweis или eID" : eat ? "Электронный вид на жительство" : "Другой документ", family ? "Переезд с семьёй" : "Переезд в одиночку", a.benefit === "none" ? "Выплат нет" : "Есть выплата, о переезде сообщить"],
    title: "Зарегистрируйте новый адрес в течение 14 дней",
    summary: `${berlin ? "При переезде внутри Берлина регистрируют новый адрес так же, как при первой регистрации." : "Из другого города Германии регистрируют новый адрес в Берлине; старое ведомство уведомляет Bürgeramt само."} Срок 14 дней после заселения, бесплатно, подтверждение выдают сразу. Договор аренды Wohnungsgeberbestätigung не заменяет.`,
    methods,
    ...(methods.length === 1 ? { singleMethodNote: eat ? "С eAT онлайн-регистрация невозможна, остаётся запись в Bürgeramt." : "Для этого документа остаётся запись в Bürgeramt." } : {}),
    steps: [...methods[0].steps, ...after],
    next: berlin ? act("Маршрут: Wohnungsgeberbestätigung", "/berlin/wohnungsgeber") : act("Маршрут: Anmeldung", "/berlin/anmeldung"),
    note,
  };
}
