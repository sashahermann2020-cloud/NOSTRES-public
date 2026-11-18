import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "WBS (разрешение на социальное жильё) в Берлине | NOSTRES", description: "Кто может получить WBS, какие нужны документы и как подать заявление онлайн, почтой или лично. По официальным страницам Берлина.", alternates: { canonical: "/berlin/wbs" } };
export default function WbsPage() { return <><GuidedRoute id="wbs" /><RouteJsonLd meta={metadata} /></>; }
