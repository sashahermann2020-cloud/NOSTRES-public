import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Билеты на транспорт Берлина и Deutschlandticket | NOSTRES",
  description: "Сравните обычные тарифы VBB, Deutschlandticket и льготы для школьников, студентов, учащихся, получателей пособий и людей с инвалидностью.",
  alternates: { canonical: "/berlin/transport-tickets" },
};

export default function TransportTicketsPage() {
  return <><GuidedRoute id="transport" /><RouteJsonLd meta={metadata} /></>;
}
