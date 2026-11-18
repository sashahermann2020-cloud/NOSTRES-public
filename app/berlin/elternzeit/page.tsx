import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Elternzeit (родительский отпуск) в Германии | NOSTRES", description: "Как оформить родительский отпуск у работодателя: сроки, защита от увольнения, неполный день и страховка. По официальным источникам.", alternates: { canonical: "/berlin/elternzeit" } };
export default function ElternzeitPage() { return <><GuidedRoute id="elternzeit" /><RouteJsonLd meta={metadata} /></>; }
