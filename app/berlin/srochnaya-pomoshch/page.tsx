import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Notfall (срочная медицинская помощь) в Берлине: 112 и 116117 | NOSTRES", description: "Определите официальный следующий контакт для экстренной и неэкстренной помощи, найдите дежурную практику.", alternates: { canonical: "/berlin/srochnaya-pomoshch" } };
export default function UrgentPage() { return <><GuidedRoute id="urgent" /><RouteJsonLd meta={metadata} /></>; }
