import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Einkommensteuererklärung (налоговая декларация) в Германии | NOSTRES", description: "Нужно ли подавать декларацию, сроки и способы: ELSTER, бумага или консультант. По официальным источникам.", alternates: { canonical: "/berlin/steuererklaerung" } };
export default function TaxPage() { return <><GuidedRoute id="steuererklaerung" /><RouteJsonLd meta={metadata} /></>; }
