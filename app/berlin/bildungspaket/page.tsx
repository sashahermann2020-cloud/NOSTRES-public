import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Bildungs- und Teilhabepaket (помощь на школу и досуг детей) в Берлине | NOSTRES", description: "Помощь на обед, школьные принадлежности, поездки, репетитора и кружки: кому положена и как получить berlinpass-BuT. По официальным источникам.", alternates: { canonical: "/berlin/bildungspaket" } };
export default function BildungspaketPage() { return <><GuidedRoute id="bildungspaket" /><RouteJsonLd meta={metadata} /></>; }
