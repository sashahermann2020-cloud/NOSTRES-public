import type { Metadata } from "next";
import StartJourney from "./StartJourney";

export const metadata: Metadata = {
  title: "Составить план действий в Берлине | NOSTRES",
  description: "Ответьте на вопросы о вашем исходном положении, получите порядок действий и проверьте онлайн- и личные способы прохождения каждого маршрута.",
  alternates: { canonical: "/berlin/start" },
  openGraph: {
    title: "Составить план действий в Берлине | NOSTRES",
    description: "Ответьте на вопросы о вашем исходном положении, получите порядок действий и проверьте онлайн- и личные способы прохождения каждого маршрута.",
    url: "https://nostres.world/berlin/start",
    locale: "ru_RU",
    siteName: "NOSTRES",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NOSTRES: самостоятельные планы действий и официальные источники" }],
  },
  twitter: {
    card: "summary",
    title: "Составить план действий в Берлине | NOSTRES",
    description: "Ответьте на вопросы о вашем исходном положении, получите порядок действий и проверьте онлайн- и личные способы прохождения каждого маршрута.",
  },
};

export default function StartPage() {
  return <StartJourney />;
}
