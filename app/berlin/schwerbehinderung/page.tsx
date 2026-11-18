import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Schwerbehindertenausweis (удостоверение тяжёлой инвалидности) в Берлине | NOSTRES", description: "Как подать заявление на Schwerbehindertenausweis в Берлине, что даёт GdB и что такое Gleichstellung. По официальным источникам.", alternates: { canonical: "/berlin/schwerbehinderung" } };
export default function SchwerbehinderungPage() { return <><GuidedRoute id="schwerbehinderung" /><RouteJsonLd meta={metadata} /></>; }
