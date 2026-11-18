import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Pflegegeld und Pflegegrad (пособие по уходу и степень нуждаемости в уходе) в Берлине | NOSTRES", description: "Pflegegeld, Pflegegrad и Pflegekasse. Как подать заявление, как проходит осмотр и какие суммы положены.", alternates: { canonical: "/berlin/pflegegeld" } };
export default function PflegegeldPage() { return <><GuidedRoute id="pflegegeld" /><RouteJsonLd meta={metadata} /></>; }
