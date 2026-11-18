/**
 * Делит строку на части: латинские фрагменты (немецкие термины и названия ведомств) и остальной текст.
 * Знаки препинания в конце латинского фрагмента остаются в обычном тексте. Цифры без букв не считаются термином.
 */
const RUN = /[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß0-9'’./§-]*(?:[  ]+[A-Za-zÄÖÜäöüß0-9][A-Za-zÄÖÜäöüß0-9'’./§-]*)*/g;

export type Segment = { text: string; german: boolean };

export function splitGermanRuns(text: string): Segment[] {
  const parts: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(RUN)) {
    const trailing = /[.'’/-]+$/.exec(match[0])?.[0] ?? "";
    const run = match[0].slice(0, match[0].length - trailing.length);
    if (!run) continue;
    const start = match.index ?? 0;
    if (start > last) parts.push({ text: text.slice(last, start), german: false });
    parts.push({ text: run, german: true });
    last = start + run.length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), german: false });
  return parts;
}
