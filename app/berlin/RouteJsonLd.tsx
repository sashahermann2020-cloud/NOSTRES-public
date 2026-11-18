import type { Metadata } from "next";
import { canonical, jsonLd, SITE_ORIGIN } from "../seo";
import { serverLocale, serverTr } from "../i18n/server-context";
import { localizedPath } from "../i18n/locales";

const SUFFIX = " | NOSTRES";

/** JSON-LD WebPage для страниц маршрутов: название и описание берутся из metadata страницы и переводятся на язык запроса. */
export default function RouteJsonLd({ meta }: { meta: Metadata }) {
  const path = String(meta.alternates?.canonical ?? "");
  const title = String(meta.title ?? "");
  const description = String(meta.description ?? "");
  if (!path || !title) return null;
  const locale = serverLocale();
  const pageUrl = canonical(localizedPath(path, locale));
  const translated = serverTr(title);
  const name = translated.endsWith(SUFFIX) ? translated.slice(0, -SUFFIX.length) : translated;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name,
    description: serverTr(description),
    inLanguage: locale,
    isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
    breadcrumb: { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: serverTr("Берлин"), item: canonical(localizedPath("/", locale)) },
      { "@type": "ListItem", position: 2, name, item: pageUrl },
    ] },
  }) }} />;
}
