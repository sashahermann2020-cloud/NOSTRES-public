import { germanRuns } from "./german-runs";
import { lh, tr } from "./i18n/store";
import { hearingBlockFor } from "./hearing-access";

/** Блок «Люди с нарушением слуха» после шагов маршрута; данные — app/hearing-access.ts. */
export default function HearingAccess({ routeId }: { routeId: string }) {
  const items = hearingBlockFor(routeId);
  if (items.length === 0) return null;
  return <details className="route-section route-sources hearing-access" id="hearing-access">
    <summary>{tr("Люди с нарушением слуха")}</summary>
    <p className="sources-intro">{germanRuns(tr("Жестовый язык, переводчик в ведомстве и связь без голоса."))}</p>
    {items.map((item) => <div className="hearing-item" key={item.id}>
      <h3>{germanRuns(tr(item.title))}</h3>
      <p>{germanRuns(tr(item.text))}</p>
      <div className="route-source-list">{item.links.map((link) => <div className="route-source-row" key={link.href}><a href={lh(link.href)} target="_blank" rel="noreferrer"><span><b>{germanRuns(tr(link.label))}</b></span><span aria-hidden="true">↗</span></a></div>)}</div>
    </div>)}
  </details>;
}
