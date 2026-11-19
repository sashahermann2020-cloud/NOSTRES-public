import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Трудная ситуация в Берлине: еда, пособия, долги, консультация | NOSTRES",
  description: "Нет денег на еду или жизнь, долги: LAIB und SEELE, пособия, бесплатные службы по долгам и миграционная консультация MBE и JMD в Берлине.",
  alternates: { canonical: "/berlin/trudnaya-situaciya" },
};

export default function HardshipPage() {
  return <><GuidedRoute id="hardship" /><RouteJsonLd meta={metadata} /></>;
}
