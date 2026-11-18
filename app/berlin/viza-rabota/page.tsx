import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Виза для работы в Германии: Blue Card и специалисты | NOSTRES",
  description: "Blue Card, виза специалиста, Anerkennungspartnerschaft и Westbalkanregelung: согласие Bundesagentur für Arbeit и подача до переезда.",
  alternates: { canonical: "/berlin/viza-rabota" },
};

export default function VizaRabotaPage() {
  return <><GuidedRoute id="workvisa" /><RouteJsonLd meta={metadata} /></>;
}
