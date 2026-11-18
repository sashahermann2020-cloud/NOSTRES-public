import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = { title: "Kfz-Ummeldung в Берлине: перерегистрация авто и мотоцикла | NOSTRES", description: "Как перерегистрировать автомобиль или мотоцикл в Берлине после переезда или внести новый адрес в Zulassungsbescheinigung. По официальным источникам.", alternates: { canonical: "/berlin/kfz-ummeldung" } };
export default function KfzPage() { return <><GuidedRoute id="kfz" /><RouteJsonLd meta={metadata} /></>; }
