import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";
export const metadata: Metadata = { title: "Учёба в Берлине: университет, Studienkolleg и Ausbildung | NOSTRES", description: "Университет, Studienkolleg или Ausbildung: выбор языка обучения, документы и шаги по официальным источникам.", alternates: { canonical: "/berlin/studium-ausbildung" } };
export default function StudyPage() { return <><GuidedRoute id="study" /><RouteJsonLd meta={metadata} /></>; }
