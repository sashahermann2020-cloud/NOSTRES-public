import { channelKindLabels, channelMatrices, channelStatusLabels } from "./channels";
import { tr, useLocale, lh } from "./i18n/store";

export default function ChannelMatrix({ id }: { id: string }) {
  useLocale();
  const matrix = channelMatrices[id];
  if (!matrix) return null;
  return <details className="route-section channel-matrix">
    <summary>{tr("Какими способами можно обратиться · проверено")} {tr(matrix.checkedAt)}</summary>
    <p className="questionnaire-intro">{tr("Сверено с официальной страницей:")} <a href={lh(matrix.sourceUrl)} target="_blank" rel="noreferrer">{tr(matrix.sourceLabel)} ↗</a> ({tr(matrix.organization)}).{matrix.moreSources && <>  {tr("Также:")} {matrix.moreSources.map((source, index) => <span key={source.url}>{index > 0 && ", "}<a href={lh(source.url)} target="_blank" rel="noreferrer">{tr(source.label)} ↗</a></span>)}.</>}  {tr("«Не указан» значит, что подтвердить способ по официальной странице не удалось, а не что он запрещён.")}</p>
    <div className="channel-table-wrap">
      <table className="channel-table">
        <caption>{tr(matrix.title)}{tr(": способы обращения")}</caption>
        <thead><tr><th scope="col">{tr("Способ")}</th><th scope="col">{tr("Статус")}</th><th scope="col">{tr("Условия")}</th></tr></thead>
        <tbody>{matrix.channels.map((channel) => <tr key={channel.kind}><th scope="row">{tr(channelKindLabels[channel.kind])}</th><td><span className={`channel-status channel-${channel.status}`}>{tr(channelStatusLabels[channel.status])}</span></td><td>{tr(channel.note)}</td></tr>)}</tbody>
      </table>
    </div>
  </details>;
}
