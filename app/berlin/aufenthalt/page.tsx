import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Aufenthaltstitel (вид на жительство): продлить в Берлине, LEA | NOSTRES",
  description: "Ответьте на четыре вопроса и получите маршрут к официальной услуге LEA: документы, онлайн-форма, подтверждение, личный приём и сроки.",
  alternates: { canonical: "/berlin/aufenthalt" },
};

export default function AufenthaltPage() { return <><GuidedRoute id="lea" /><RouteJsonLd meta={metadata} /></>; }
