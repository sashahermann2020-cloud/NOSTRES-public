import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import AnmeldungJourney from "../anmeldung/AnmeldungJourney";

export const metadata: Metadata = {
  title: "Krankenversicherung (медицинская страховка) в Германии: GKV, eGK и Jobcenter | NOSTRES",
  description: "Самостоятельный официальный маршрут: определить основание страхования, выбрать Krankenkasse, подать онлайн или через офис и получить eGK.",
  alternates: { canonical: "/berlin/health-insurance" },
  openGraph: {
    title: "Krankenversicherung (медицинская страховка): маршрут NOSTRES",
    description: "Работа, учёба, семья, Jobcenter и eGK: персональный путь только по официальным источникам.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NOSTRES: самостоятельные планы действий и официальные источники" }],
  },
};

export default function HealthInsurancePage() {
  return <><AnmeldungJourney journeyId="health" /><RouteJsonLd meta={metadata} /></>;
}
