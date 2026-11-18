import type { Metadata } from "next";
import RouteJsonLd from "../../RouteJsonLd";
import GuidedRoute from "../../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Hund (собака: регистрация, налог, опасные породы) в Берлине | NOSTRES", description: "Hunderegister, налог на собаку, правила прогулок и порядок для Listenhunde (Pit Bull, American Staffordshire, Bull Terrier и помеси) по страницам Берлина.", alternates: { canonical: "/berlin/sobaka/marshrut" } };
export default function DogRoutePage() { return <><GuidedRoute id="dog" /><RouteJsonLd meta={metadata} /></>; }
