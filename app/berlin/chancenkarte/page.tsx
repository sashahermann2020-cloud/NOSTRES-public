import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Chancenkarte: баллы, средства и виза | NOSTRES",
  description: "Посчитайте баллы Chancenkarte по официальной таблице, подготовьте Sperrkonto и документы и подайте визу через Auslandsportal.",
  alternates: { canonical: "/berlin/chancenkarte" },
};

export default function ChancenkartePage() {
  return <><GuidedRoute id="chancenkarte" /><RouteJsonLd meta={metadata} /></>;
}
