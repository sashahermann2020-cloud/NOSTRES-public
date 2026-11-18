import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Kinderzuschlag (доплата к Kindergeld для семей с небольшим доходом) в Германии | NOSTRES", description: "Условия, документы и онлайн-заявление на Kinderzuschlag в Familienkasse. По официальным источникам.", alternates: { canonical: "/berlin/kinderzuschlag" } };
export default function KinderzuschlagPage() { return <><GuidedRoute id="kinderzuschlag" /><RouteJsonLd meta={metadata} /></>; }
