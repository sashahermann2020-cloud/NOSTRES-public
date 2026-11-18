import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Kindergeld (пособие на ребёнка) в Германии: как подать заявление | NOSTRES", description: "Кто может получить Kindergeld, как подать заявление онлайн или с подписью, какие нужны документы и что делать без ответа. Источник: Bundesagentur für Arbeit.", alternates: { canonical: "/berlin/kindergeld" } };
export default function KindergeldPage() { return <><GuidedRoute id="kindergeld" /><RouteJsonLd meta={metadata} /></>; }
