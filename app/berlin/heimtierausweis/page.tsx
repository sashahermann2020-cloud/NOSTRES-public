import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";
export const metadata: Metadata = { title: "EU-Heimtierausweis (паспорт животного ЕС) в Берлине | NOSTRES", description: "Кто выдаёт паспорт животного ЕС в Берлине, что нужно до него (чип и прививка от бешенства), сколько стоит и действует ли паспорт другой страны ЕС.", alternates: { canonical: "/berlin/heimtierausweis" } };
export default function PetPassportPage() { return <><GuidedRoute id="petpass" /><RouteJsonLd meta={metadata} /></>; }
