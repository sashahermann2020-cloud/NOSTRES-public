"use client";

import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { tr, useLocale } from "./store";

/** Переводит текстовые узлы внутри уже собранной разметки; пробелы по краям сохраняются. */
function translateNode(node: ReactNode): ReactNode {
  if (typeof node === "string") {
    const match = node.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!match || !match[2]) return node;
    return `${match[1]}${tr(match[2].replace(/\s*\n\s*/g, " "))}${match[3]}`;
  }
  if (Array.isArray(node)) return Children.map(node, translateNode);
  if (isValidElement<Record<string, unknown> & { children?: ReactNode }>(node)) {
    const props: Record<string, unknown> = {};
    for (const name of ["aria-label", "title", "alt", "placeholder"]) {
      const value = node.props[name];
      if (typeof value === "string") props[name] = tr(value);
    }
    const children = node.props.children;
    if (children === undefined || children === null) return Object.keys(props).length ? cloneElement(node, props) : node;
    return cloneElement(node, props, Children.map(children, translateNode));
  }
  return node;
}

/** Серверные страницы (о проекте, конфиденциальность, контакты) остаются в HTML на русском, а в браузере следуют выбранному языку. */
export default function Translated({ children }: { children: ReactNode }) {
  useLocale();
  return <>{translateNode(children)}</>;
}
