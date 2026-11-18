import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Kita, Schule und Geburt (детский сад, школа, рождение ребёнка) в Берлине | NOSTRES", description: "Kita-Gutschein, запись в школу и регистрация рождения в Standesamt: сроки, способы и документы. По официальным страницам Берлина.", alternates: { canonical: "/berlin/kita-schule" } };
export default function KitaPage() { return <><GuidedRoute id="kita" /><RouteJsonLd meta={metadata} /></>; }
