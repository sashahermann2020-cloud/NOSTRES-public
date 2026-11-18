import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import AnmeldungJourney from "./AnmeldungJourney";

export const metadata: Metadata = {
  title: "Anmeldung (регистрация адреса) в Берлине: онлайн или лично | NOSTRES",
  description: "Персональный маршрут регистрации адреса в Берлине: проверка доступности онлайн-подачи, запись в Bürgeramt, документы, сроки и официальные источники.",
  alternates: { canonical: "/berlin/anmeldung" },
  openGraph: {
    title: "Anmeldung (регистрация адреса): маршрут NOSTRES",
    description: "Ответьте на вопросы, выберите доступный способ и пройдите официальную регистрацию адреса до Meldebestätigung.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NOSTRES: самостоятельные планы действий и официальные источники" }],
  },
};

export default function AnmeldungPage() {
  return <><AnmeldungJourney /><RouteJsonLd meta={metadata} /></>;
}
