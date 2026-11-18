export type Answers = Record<string, string>;
export type Action = { label: string; href: string };
export type Question = { id: string; prompt: string; options: readonly (readonly [string, string])[] };
export type Step = { title: string; detail: string; mode: "Онлайн" | "Лично" | "Звонок" | "Почта" | "Ожидание" | "Выбор"; action: Action; alternative?: Action; source: Action };

/** Тип достоверности срока или суммы (спецификация §9.8). */
export type FactKind = "official" | "provider" | "authority" | "editorial" | "load" | "none";
export type Fact = { label: string; value: string; kind: FactKind };

/** Готовый вариант исполнителя (банк, касса, провайдер) с проверкой по его собственным официальным страницам. */
export type Provider = {
  id: string;
  name: string;
  label?: string;
  summary: string;
  facts: Fact[];
  conditions?: string[];
  links: Action[];
};

export type MethodKind = "online" | "in-person" | "combined" | "mail" | "phone";
export type Method = {
  id: string;
  kind: MethodKind;
  title: string;
  summary: string;
  availability: "available" | "conditional";
  availabilityLabel: string;
  conditions: string[];
  documents: string[];
  facts?: Fact[];
  providers?: Provider[];
  providersTitle?: string;
  providersNote?: string;
  steps: Step[];
};

/** Результат применимости (спецификация §9.2). */
export type Fit = "fits" | "conditional" | "insufficient" | "redirect" | "clarify";

export type Plan = {
  title: string;
  summary: string;
  steps: Step[];
  note?: string;
  supported?: boolean;
  fit?: Fit;
  /** Какие ответы повлияли на результат (спецификация §11.3). */
  why?: string[];
  /** Способы выполнения. Если способ один, он выбирается автоматически и объясняется. */
  methods?: Method[];
  /** Если способ один, почему выбора нет (спецификация §9.4.6). */
  singleMethodNote?: string;
  next?: Action;
};

export const fitLabels: Record<Fit, string> = {
  fits: "Подходит вам",
  conditional: "Подходит при выполнении условия",
  insufficient: "Начните с этого шага",
  redirect: "Вам нужен другой маршрут",
  clarify: "Сначала выберите форму",
};

export const factKindLabels: Record<FactKind, string> = {
  official: "официальный срок или сумма",
  provider: "цена из официальных документов банка или провайдера",
  authority: "ориентир ведомства или официальной организации",
  editorial: "оценка NOSTRES, не срок ведомства",
  load: "зависит от загруженности",
  none: "официальных данных нет",
};

export const methodKindLabels: Record<MethodKind, string> = {
  online: "Онлайн",
  "in-person": "Лично",
  combined: "Онлайн и лично",
  mail: "Почта",
  phone: "Телефон или письменно",
};

/** Пять статусов результата (спецификация §9.9, RES-02). */
export const outcomeOptions = [
  { value: "received", label: "Результат получен", event: "goal_achieved" },
  { value: "waiting", label: "Заявление отправлено, жду ответ", event: "result_waiting" },
  { value: "additional", label: "Просят дополнительный документ", event: "additional_document_requested" },
  { value: "refused", label: "Получен отказ", event: "official_refusal_reported" },
  { value: "blocked", label: "Не понимаю результат или не могу пройти шаг", event: "step_blocked" },
] as const;

export const outcomeHelp: Record<string, string> = {
  waiting: "Сохраните подтверждение действия: письмо, номер заявления или скриншот. Срок и статус проверяйте на открытой официальной странице или в письме. Если срок прошёл, а ответа нет, не считайте это ни согласием, ни отказом: используйте контакт ведомства на странице услуги.",
  additional: "Запишите, какого именно документа просят и до какого срока. Ответьте тем же каналом, которым пришёл запрос. Если непонятно, что требуется, напишите в ведомство по контакту из письма, укажите номер дела (Aktenzeichen) и сохраните ответ.",
  refused: "Сохраните письменный отказ и основание. Проверьте на официальной странице, как оспорить решение и в какой срок. Если путь по вашему случаю не описан, сообщите об этом ниже: мы исправим маршрут.",
  blocked: "Вернитесь к шагу, на котором остановились, и проверьте условия и запасной канал. Если официальная страница не помогает, сообщите об этом ниже и выберите другой способ в списке способов.",
};
