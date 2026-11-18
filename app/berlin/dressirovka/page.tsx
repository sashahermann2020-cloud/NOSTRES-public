import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";
export const metadata: Metadata = { title: "Hundeschule и Hundeführerschein (дрессировка и экзамен владельца собаки) в Берлине | NOSTRES", description: "Как проверить разрешение дрессировщика по § 11 Tierschutzgesetz, где сдать Sachkundeprüfung для прогулок без поводка и кто проводит Wesenstest в Берлине.", alternates: { canonical: "/berlin/dressirovka" } };
export default function DogTrainerPage() { return <><GuidedRoute id="dogtrainer" /><RouteJsonLd meta={metadata} /></>; }
