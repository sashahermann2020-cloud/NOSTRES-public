import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import AnmeldungJourney from "../anmeldung/AnmeldungJourney";

export const metadata: Metadata = {
  title: "Steuer-ID (налоговый номер) в Германии: получить или восстановить | NOSTRES",
  description: "Персональный официальный маршрут Steuer-ID: автоматическая выдача после Anmeldung, повторный онлайн-запрос, срочный Finanzamt и процедура без Meldepflicht.",
  alternates: { canonical: "/berlin/steuer-id" },
  openGraph: {
    title: "Steuer-ID (налоговый номер): маршрут NOSTRES",
    description: "Ответьте на вопросы и выберите официальный путь к личной steuerliche Identifikationsnummer.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NOSTRES — самостоятельные планы действий и официальные источники" }],
  },
};

export default function SteuerIdPage() {
  return <><AnmeldungJourney journeyId="tax-id" /><RouteJsonLd meta={metadata} /></>;
}
