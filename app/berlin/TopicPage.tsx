import TopicBody from "./TopicBody";
import { canonical, jsonLd, SITE_ORIGIN } from "../seo";
import type { Topic } from "./topics";
import { serverLocale, serverTr } from "../i18n/server-context";
import { localizedPath } from "../i18n/locales";

export default function TopicPage({ topic }: { topic: Topic }) {
  const locale = serverLocale();
  const pageUrl = canonical(localizedPath(topic.path, locale));
  return <main className="start-page" id="top" tabIndex={-1}>
    <TopicBody topic={topic} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: serverTr(topic.title),
      description: serverTr(topic.description),
      inLanguage: locale,
      isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
      citation: topic.facts.map((fact) => fact.source),
      breadcrumb: { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: serverTr("Берлин"), item: canonical(localizedPath("/", locale)) },
        { "@type": "ListItem", position: 2, name: serverTr(topic.title), item: pageUrl },
      ] },
    }) }} />
  </main>;
}
