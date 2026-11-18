import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Stellensuche (поиск работы по найму) в Германии | NOSTRES", description: "Можно ли вам работать по найму, где искать вакансии и куда обращаться, если работодатель нарушает условия. Источники: Bundesagentur für Arbeit, Zoll, Берлин.", alternates: { canonical: "/berlin/rabota-po-najmu" } };
export default function EmploymentPage() { return <><GuidedRoute id="employment" /><RouteJsonLd meta={metadata} /></>; }
