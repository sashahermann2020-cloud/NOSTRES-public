import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Номер соцстрахования и медстраховки в Германии | NOSTRES",
  description: "Sozialversicherungsnummer для работодателя: первая работа, забытый номер, бесплатный Versicherungsnummernachweis. Номер медстраховки на карте eGK.",
  alternates: { canonical: "/berlin/sozialversicherungsnummer" },
};

export default function SozialversicherungsnummerPage() {
  return <><GuidedRoute id="socialnumber" /><RouteJsonLd meta={metadata} /></>;
}
