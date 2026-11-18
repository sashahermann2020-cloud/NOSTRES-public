import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Mutterschutz und Mutterschaftsgeld (защита материнства и пособие по материнству) в Берлине | NOSTRES", description: "Как получить Mutterschaftsgeld, что доплачивает работодатель и как работает защита от увольнения. По официальным источникам.", alternates: { canonical: "/berlin/mutterschutz" } };
export default function MutterschutzPage() { return <><GuidedRoute id="mutterschutz" /><RouteJsonLd meta={metadata} /></>; }
