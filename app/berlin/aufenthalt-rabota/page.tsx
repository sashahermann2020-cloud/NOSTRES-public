import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";
export const metadata: Metadata = { title: "Aufenthaltstitel für Beschäftigung (вид на жительство для работы) в Берлине | NOSTRES", description: "Blue Card, вид на жительство специалиста и Chancenkarte: какой путь подходит, документы и онлайн-заявление в Берлине. По официальным источникам.", alternates: { canonical: "/berlin/aufenthalt-rabota" } };
export default function WorkPermitPage() { return <><GuidedRoute id="workpermit" /><RouteJsonLd meta={metadata} /></>; }
