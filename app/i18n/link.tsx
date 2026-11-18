"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { lh } from "./store";

/** Внутренняя ссылка, которая ведёт на тот же язык, что и текущая страница. */
export default function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  return <NextLink href={typeof href === "string" ? lh(href) : href} {...rest} />;
}
