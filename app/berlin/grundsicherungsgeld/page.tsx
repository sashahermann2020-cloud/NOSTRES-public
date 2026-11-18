import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Grundsicherungsgeld (бывшее Bürgergeld: основное пособие для нуждающихся) в Берлине | NOSTRES", description: "Кто получает Grundsicherungsgeld, из чего оно состоит и как подать заявление в Jobcenter. По официальным источникам.", alternates: { canonical: "/berlin/grundsicherungsgeld" } };
export default function GrundsicherungsgeldPage() { return <><GuidedRoute id="grundsicherungsgeld" /><RouteJsonLd meta={metadata} /></>; }
