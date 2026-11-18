import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Wohnungssuche (поиск квартиры или комнаты) в Берлине: документы, SCHUFA | NOSTRES",
  description: "Ответьте на четыре вопроса и получите план поиска жилья в Берлине: документы для заявки, муниципальные предложения, WBS и проверка возможности Anmeldung.",
  alternates: { canonical: "/berlin/wohnungssuche" },
};

export default function HousingPage() {
  return <><GuidedRoute id="housing" /><RouteJsonLd meta={metadata} /></>;
}
