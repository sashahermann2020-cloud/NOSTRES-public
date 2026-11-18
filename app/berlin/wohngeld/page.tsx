import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Wohngeld (жилищная доплата к аренде или расходам на жильё) в Берлине | NOSTRES", description: "Кто получает Wohngeld, какие документы нужны и как подать заявление онлайн или на бумаге. По официальным источникам.", alternates: { canonical: "/berlin/wohngeld" } };
export default function WohngeldPage() { return <><GuidedRoute id="wohngeld" /><RouteJsonLd meta={metadata} /></>; }
