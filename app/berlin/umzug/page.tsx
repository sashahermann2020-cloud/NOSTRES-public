import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Umzug (переезд и смена адреса) в Берлине | NOSTRES", description: "Как сменить адрес в Берлине: регистрация в течение 14 дней, онлайн или в Bürgeramt, Rundfunkbeitrag и выплаты. По официальным источникам.", alternates: { canonical: "/berlin/umzug" } };
export default function UmzugPage() { return <><GuidedRoute id="umzug" /><RouteJsonLd meta={metadata} /></>; }
