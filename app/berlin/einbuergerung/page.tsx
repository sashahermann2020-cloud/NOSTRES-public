import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Einbürgerung (получение гражданства Германии) в Берлине | NOSTRES", description: "Условия, документы, тест и онлайн-заявление на получение гражданства Германии в Берлине. По официальным источникам.", alternates: { canonical: "/berlin/einbuergerung" } };
export default function EinbuergerungPage() { return <><GuidedRoute id="einbuergerung" /><RouteJsonLd meta={metadata} /></>; }
