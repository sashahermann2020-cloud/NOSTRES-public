"use client";

import { Children, isValidElement, useState, type ReactElement, type ReactNode } from "react";
import { tr } from "./i18n/store";
import { THEMES } from "./route-themes";

// Разделы главной: темы из app/route-themes.ts. Карточка попадает в раздел своей основной темы (data-cat).
// Когда выбран фильтр или введён поиск, разделы не нужны: показывается одна сетка найденных карточек,
// без сворачиваемых панелей, чтобы не было панелей с одной карточкой.

type CardProps = { "data-cat"?: string };

export default function GroupedGrid({ children, flat }: { children: ReactNode; flat: boolean }) {
  const [openThemes, setOpenThemes] = useState<Record<string, boolean>>({ "Переезд в Германию": true, "Документы и статус": true });
  if (flat) return <div className="journey-grid theme-grid flat-grid">{children}</div>;
  const groups = new Map<string, ReactElement[]>();
  const rest: ReactNode[] = [];
  for (const child of Children.toArray(children)) {
    const cat = isValidElement<CardProps>(child) ? child.props["data-cat"] : undefined;
    if (!cat) { rest.push(child); continue; }
    groups.set(cat, [...(groups.get(cat) ?? []), child as ReactElement]);
  }
  const order: string[] = [...THEMES];
  const ordered = [...order.filter((theme) => groups.has(theme)), ...[...groups.keys()].filter((theme) => !order.includes(theme))];
  return (
    <div className="theme-groups">
      {ordered.map((theme) => {
        const cards = groups.get(theme) ?? [];
        const open = Boolean(openThemes[theme]);
        return (
          <section className={open ? "theme-group open" : "theme-group"} key={theme}>
            <button className="theme-head" type="button" aria-expanded={open} onClick={() => setOpenThemes((prev) => ({ ...prev, [theme]: !open }))}>
              <span className="theme-name">{tr(theme)}</span>
              <span className="theme-count">{cards.length}</span>
              <span className="theme-chevron" aria-hidden="true" />
            </button>
            <div className="journey-grid theme-grid" hidden={!open}>{cards}</div>
          </section>
        );
      })}
      {rest}
    </div>
  );
}
