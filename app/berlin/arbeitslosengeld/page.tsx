import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Arbeitslosengeld (пособие по безработице) в Берлине | NOSTRES", description: "Кто получает Arbeitslosengeld, сколько и как долго, что такое Sperrzeit и как подать заявление. По официальным источникам.", alternates: { canonical: "/berlin/arbeitslosengeld" } };
export default function ArbeitslosengeldPage() { return <><GuidedRoute id="arbeitslosengeld" /><RouteJsonLd meta={metadata} /></>; }
