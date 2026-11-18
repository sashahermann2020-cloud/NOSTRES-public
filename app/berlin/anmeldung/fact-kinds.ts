import type { FactKind } from "../new-routes/route-model.ts";

export type FactField = "deadline" | "preparationTime" | "appointmentTime" | "processingTime" | "fee";
export const factFieldOrder: FactField[] = ["deadline", "preparationTime", "appointmentTime", "processingTime", "fee"];

/** Тип достоверности каждого срока и суммы у способов Anmeldung, Steuer-ID и медицинской страховки (спецификация §11).
 * official — закон или официальное правило; authority — ориентир ведомства; editorial — оценка NOSTRES;
 * load — зависит от загруженности; none — официальных данных нет. */
const k = (deadline: FactKind, preparationTime: FactKind, appointmentTime: FactKind, processingTime: FactKind, fee: FactKind): Record<FactField, FactKind> => ({ deadline, preparationTime, appointmentTime, processingTime, fee });

export const factKinds: Record<string, Record<FactField, FactKind>> = {
  "anmeldung-online": k("official", "authority", "official", "authority", "official"),
  "anmeldung-personal": k("official", "load", "none", "official", "official"),
  "taxid-find": k("official", "editorial", "official", "editorial", "official"),
  "taxid-wait": k("authority", "editorial", "official", "authority", "official"),
  "taxid-online": k("authority", "editorial", "official", "authority", "official"),
  "taxid-urgent": k("official", "editorial", "none", "none", "official"),
  "taxid-anmeldung-first": k("official", "load", "official", "authority", "official"),
  "taxid-nonresident-employee": k("none", "editorial", "official", "none", "official"),
  "taxid-nonresident-tax": k("none", "editorial", "official", "none", "official"),
  "health-employee-online": k("authority", "none", "official", "none", "official"),
  "health-employee-direct": k("authority", "none", "none", "none", "official"),
  "health-student": k("authority", "none", "none", "none", "official"),
  "health-family": k("none", "none", "none", "none", "official"),
  "health-benefit": k("authority", "load", "official", "none", "official"),
  "health-egk": k("official", "none", "official", "none", "official"),
  "health-switch-gkv": k("official", "none", "official", "none", "official"),
  "health-clarify": k("editorial", "editorial", "official", "none", "official"),
};

export const factKindFor = (methodId: string, field: FactField): FactKind => factKinds[methodId]?.[field] ?? "none";
