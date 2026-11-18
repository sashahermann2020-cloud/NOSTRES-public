import { Fragment, type ReactNode } from "react";
import { currentLocale } from "./i18n/store.ts";
import { splitGermanRuns } from "./german-runs-split.ts";

/**
 * Немецкие термины внутри русского или арабского текста размечаются `lang="de"`,
 * чтобы экранный диктор читал «Anmeldung» или «Jobcenter» немецким произношением, а не русским или арабским.
 * На этих языках латиница в тексте маршрута — это немецкие термины и названия ведомств.
 * Для языков на латинице граница термина по письму не видна; там размечаются только явные немецкие названия (карточки главной).
 */
const NON_LATIN = new Set(["ru", "ar"]);

export function germanRuns(text: string | null | undefined): ReactNode {
  if (!text || !NON_LATIN.has(currentLocale())) return text;
  const parts = splitGermanRuns(text);
  if (!parts.some((part) => part.german)) return text;
  // Одна обёртка: во flex-ссылках и кнопках текст остаётся одним элементом и переносится, а не распадается на части.
  return <span className="de-runs">{parts.map((part, index) => part.german ? <span lang="de" key={index}>{part.text}</span> : <Fragment key={index}>{part.text}</Fragment>)}</span>;
}
