import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Wohnungsgeberbestätigung (подтверждение заселения от арендодателя) в Берлине | NOSTRES", description: "Что должно быть в Wohnungsgeberbestätigung, в какой срок её выдают арендодатель и что делать, если он отказывает. По официальным источникам.", alternates: { canonical: "/berlin/wohnungsgeber" } };
export default function WohnungsgeberPage() { return <><GuidedRoute id="wohnungsgeber" /><RouteJsonLd meta={metadata} /></>; }
