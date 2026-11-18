import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";
export const metadata: Metadata = { title: "Familiennachzug (воссоединение семьи) в Берлине | NOSTRES", description: "Вид на жительство для супруга или ребёнка: виза, условия, документы и онлайн-заявление в Берлине. По официальным источникам.", alternates: { canonical: "/berlin/familiennachzug" } };
export default function FamiliennachzugPage() { return <><GuidedRoute id="reunion" /><RouteJsonLd meta={metadata} /></>; }
