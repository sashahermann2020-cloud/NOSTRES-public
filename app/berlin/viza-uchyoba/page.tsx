import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Виза для учёбы, поступления и Ausbildung | NOSTRES",
  description: "Учебная виза, виза для поступления и для Ausbildung: средства на 2026 год, Sperrkonto, документы и подача через Auslandsportal.",
  alternates: { canonical: "/berlin/viza-uchyoba" },
};

export default function VizaUchyobaPage() {
  return <><GuidedRoute id="studyvisa" /><RouteJsonLd meta={metadata} /></>;
}
