import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Agentur für Arbeit и Jobcenter (потеря работы и пособия) в Германии | NOSTRES", description: "Как встать на учёт как безработный и подать на Arbeitslosengeld или Grundsicherung в Jobcenter: сроки, способы и документы. Источник: Bundesagentur für Arbeit.", alternates: { canonical: "/berlin/jobcenter" } };
export default function JobcenterPage() { return <><GuidedRoute id="jobcenter" /><RouteJsonLd meta={metadata} /></>; }
