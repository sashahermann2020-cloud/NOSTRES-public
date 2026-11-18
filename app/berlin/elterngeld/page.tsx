import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Elterngeld (пособие родителям после рождения ребёнка) в Германии | NOSTRES", description: "Кто получает Elterngeld, документы и подача заявления в Elterngeldstelle Берлина. По официальным источникам.", alternates: { canonical: "/berlin/elterngeld" } };
export default function ElterngeldPage() { return <><GuidedRoute id="elterngeld" /><RouteJsonLd meta={metadata} /></>; }
