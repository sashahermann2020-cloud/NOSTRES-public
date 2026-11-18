"use client";

import { tr, useLocale } from "./store";

/** Ссылка «Перейти к основному содержимому» для клавиатуры и чтения с экрана; текст следует за языком интерфейса. */
export default function SkipLink() {
  useLocale();
  return <a className="skip-link" href="#top">{tr("Перейти к основному содержимому")}</a>;
}
