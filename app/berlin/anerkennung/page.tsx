import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";
export const metadata: Metadata = { title: "Anerkennung (признание иностранного диплома или профессии) в Берлине | NOSTRES", description: "Ведомство для вашей профессии, документы, сроки и результаты признания иностранной квалификации. По официальным источникам.", alternates: { canonical: "/berlin/anerkennung" } };
export default function RecognitionPage() { return <><GuidedRoute id="recognition" /><RouteJsonLd meta={metadata} /></>; }
