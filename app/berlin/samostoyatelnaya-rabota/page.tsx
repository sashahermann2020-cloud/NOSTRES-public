import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Gewerbe или Freiberuf (своё дело или фриланс) в Берлине | NOSTRES", description: "Проверьте, можно ли вам работать на себя, и выберите путь к Gewerbeanmeldung и налоговой анкете ELSTER по официальным страницам.", alternates: { canonical: "/berlin/samostoyatelnaya-rabota" } };
export default function BusinessPage() { return <><GuidedRoute id="business" /><RouteJsonLd meta={metadata} /></>; }
