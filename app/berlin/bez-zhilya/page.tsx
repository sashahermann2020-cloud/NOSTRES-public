import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Без жилья в Берлине: ночлег, Soziale Wohnhilfe, выселение | NOSTRES",
  description: "Негде ночевать, нет жилья или грозит выселение: ночлежки Kältehilfe, Soziale Wohnhilfe района и погашение долга за аренду в Берлине.",
  alternates: { canonical: "/berlin/bez-zhilya" },
};

export default function HomelessPage() {
  return <><GuidedRoute id="homeless" /><RouteJsonLd meta={metadata} /></>;
}
