import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Niederlassungserlaubnis: бессрочный ВНЖ (ПМЖ) в Берлине | NOSTRES",
  description: "Когда можно получить Niederlassungserlaubnis: специалисты, Blue Card, семья граждан Германии, беженцы. Сроки, немецкий B1 или A1, документы, LEA.",
  alternates: { canonical: "/berlin/niederlassungserlaubnis" },
};

export default function NiederlassungserlaubnisPage() {
  return <><GuidedRoute id="settlement" /><RouteJsonLd meta={metadata} /></>;
}
