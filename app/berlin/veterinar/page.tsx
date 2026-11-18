import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";
export const metadata: Metadata = { title: "Tierarzt (ветеринар в Берлине): срочная помощь и приём на вашем языке | NOSTRES", description: "Дежурные ветклиники Берлина по списку ветеринарной палаты, тариф ночью и в выходные и практики, где говорят на русском, украинском, арабском, турецком и др.", alternates: { canonical: "/berlin/veterinar" } };
export default function VetPage() { return <><GuidedRoute id="vet" /><RouteJsonLd meta={metadata} /></>; }
