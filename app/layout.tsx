import type { Metadata } from "next";
import { canonical, jsonLd, SITE_ORIGIN } from "./seo";
import "./globals.css";
import TextSizeControl from "./TextSizeControl";
import SourceCapture from "./SourceCapture";
import OfflineSupport from "./OfflineSupport";
import SkipLink from "./i18n/SkipLink";
import { serverDir, serverLocale, serverTr } from "./i18n/server-context";

// Язык берётся из контекста запроса (AsyncLocalStorage), поэтому страницы нельзя кэшировать по пути.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "NOSTRES: что делать после переезда",
  description: "Бесплатные пошаговые маршруты после переезда в Берлин: документы, жильё, здоровье, работа, семья, пособия, транспорт и животные.",
  alternates: { canonical: "/" },
  verification: { yandex: "8b98c1ba085a5f77" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "NOSTRES: понятный путь после переезда",
    description: "NOSTRES ведёт шаг за шагом после переезда в Берлин: документы, жильё, здоровье, работа, семья, пособия, транспорт и животные.",
    url: canonical("/"),
    locale: "ru_RU",
    siteName: "NOSTRES",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NOSTRES: понятный путь после переезда; первый пилот: Берлин" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOSTRES: понятный путь после переезда",
    description: "Бесплатные маршруты NOSTRES по Берлину: документы, жильё, здоровье, работа, семья, пособия, транспорт и животные.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={serverLocale()} dir={serverDir()}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${SITE_ORIGIN}/#website`,
          name: "NOSTRES",
          url: SITE_ORIGIN,
          inLanguage: serverLocale(),
          description: serverTr("NOSTRES: бесплатный информационный сервис с пошаговыми маршрутами после переезда: документы, жильё, здоровье, работа, семья, пособия, банк и связь, транспорт и животные. Первый город: Берлин; другие города планируются."),
        }) }} />
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('nostres-text-size');if(t==='large'||t==='xlarge')document.documentElement.dataset.text=t}catch(e){}" }} />
        <link rel="manifest" href={`/manifest/${serverLocale()}.webmanifest`} />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#f1f4f7" />
        <meta name="apple-mobile-web-app-title" content="NOSTRES" />
        <link rel="preload" href="/fonts/nostres-onest-cyrillic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/nostres-source-serif-cyrillic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body><SkipLink /><OfflineSupport />{children}<TextSizeControl /><SourceCapture /></body>
    </html>
  );
}
