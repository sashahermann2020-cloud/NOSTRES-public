import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Домашнее насилие в Берлине: BIG Hotline, Frauenhaus, помощь | NOSTRES",
  description: "Помощь при домашнем насилии в Берлине: BIG Hotline круглосуточно, Frauenhaus, чат без звонка, помощь мужчинам и детям, документация травм.",
  alternates: { canonical: "/berlin/domashnee-nasilie" },
};

export default function ViolencePage() {
  return <><GuidedRoute id="violence" /><RouteJsonLd meta={metadata} /></>;
}
