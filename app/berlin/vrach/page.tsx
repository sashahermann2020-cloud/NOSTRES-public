import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Arztsuche (поиск врача и запись) в Берлине | NOSTRES", description: "Выберите страхование и нужного врача. Получите официальный путь к поиску практики, записи через 116117 и визиту.", alternates: { canonical: "/berlin/vrach" } };
export default function DoctorPage() { return <><GuidedRoute id="doctor" /><RouteJsonLd meta={metadata} /></>; }
