import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Girokonto (банковский счёт): как открыть в Германии | NOSTRES", description: "Обычный Girokonto или Basiskonto: документы, адрес, срок решения банка и что делать при отказе, по официальным страницам BaFin.", alternates: { canonical: "/berlin/bank" } };
export default function BankPage() { return <><GuidedRoute id="bank" /><RouteJsonLd meta={metadata} /></>; }
