import type { MetadataRoute } from "next";
import { canonical, INDEXABLE_PATHS } from "./seo.ts";
import { localizedPath, READY_LOCALES } from "./i18n/locales.ts";

/** Каждая страница есть на всех готовых языках; у каждой записи указаны все языковые версии (hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_PATHS.flatMap((path) => {
    const languages: Record<string, string> = Object.fromEntries(READY_LOCALES.map((item) => [item.code, canonical(localizedPath(path, item.code))]));
    languages["x-default"] = canonical(path);
    return READY_LOCALES.map((item) => ({ url: canonical(localizedPath(path, item.code)), alternates: { languages } }));
  });
}
