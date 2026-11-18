import { Fragment } from "react";
import { explainTerms } from "./term-explanations";
import { germanRuns } from "./german-runs";

/** Для заголовков и названий: пояснение к немецкому термину выводится мелким шрифтом рядом с термином. */
export default function ExplainedText({ text }: { text: string }) {
  const parts = explainTerms(text).split(/( \([^()]+\))/);
  return <>{parts.map((part, index) => index % 2 === 1 ? <small className="term-note" key={index}>{germanRuns(part)}</small> : <Fragment key={index}>{germanRuns(part)}</Fragment>)}</>;
}
