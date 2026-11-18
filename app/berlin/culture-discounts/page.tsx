import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Льготы на культуру и досуг в Берлине | NOSTRES",
  description: "Найдите бесплатные музеи и события, предложения для детей и семей, льготы для получателей пособий, студентов, людей с инвалидностью и людей с низким доходом.",
  alternates: { canonical: "/berlin/culture-discounts" },
};

export default function CultureDiscountsPage() {
  return <><GuidedRoute id="culture" /><RouteJsonLd meta={metadata} /></>;
}
