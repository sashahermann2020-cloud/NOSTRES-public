import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Переезд в Германию: какой путь подходит | NOSTRES",
  description: "Нужна ли виза и какой путь подходит: работа, Chancenkarte, учёба, Ausbildung, волонтёрская служба, семья или Working Holiday.",
  alternates: { canonical: "/berlin/pereezd-v-germaniyu" },
};

export default function PereezdVGermaniyuPage() {
  return <><GuidedRoute id="relocation" /><RouteJsonLd meta={metadata} /></>;
}
