import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Mobilfunk и Internet (мобильная связь и интернет) | NOSTRES", description: "Что проверить перед договором, как сменить провайдера или расторгнуть договор и что делать при проблемах со скоростью и связью, по правилам Bundesnetzagentur.", alternates: { canonical: "/berlin/svyaz" } };
export default function TelecomPage() { return <><GuidedRoute id="telecom" /><RouteJsonLd meta={metadata} /></>; }
