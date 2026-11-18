import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";
export const metadata: Metadata = { title: "Integrationskurs (интеграционный и языковой курс) в Берлине | NOSTRES", description: "Допуск, запись, стоимость и освобождение от взноса для интеграционного курса в Берлине. По официальным источникам.", alternates: { canonical: "/berlin/integrationskurs" } };
export default function IntegrationskursPage() { return <><GuidedRoute id="language" /><RouteJsonLd meta={metadata} /></>; }
