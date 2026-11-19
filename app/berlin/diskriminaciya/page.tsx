import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Дискриминация в Берлине: консультация, жалоба, сроки AGG | NOSTRES",
  description: "Бесплатная помощь при дискриминации в Берлине: жильё, работа, услуги, ведомства и полиция. Консультации, LADG-Ombudsstelle и срок 2 месяца по AGG.",
  alternates: { canonical: "/berlin/diskriminaciya" },
};

export default function DiscriminationPage() {
  return <><GuidedRoute id="discrimination" /><RouteJsonLd meta={metadata} /></>;
}
