import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";
export const metadata: Metadata = { title: "Sprachkurs (языковые курсы) в Берлине | NOSTRES", description: "Выберите язык для изучения и язык объяснений: курсы vhs Берлина, Goethe-Institut, Integrationskurs и Berufssprachkurs с официальными шагами.", alternates: { canonical: "/berlin/sprachkurs" } };
export default function SprachkursPage() { return <><GuidedRoute id="sprachkurs" /><RouteJsonLd meta={metadata} /></>; }
