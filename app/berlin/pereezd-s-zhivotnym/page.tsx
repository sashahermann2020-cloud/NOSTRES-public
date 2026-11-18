import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";
export const metadata: Metadata = { title: "Переезд в Германию с собакой, кошкой или другим животным | NOSTRES", description: "Чип, прививка от бешенства, тест на антитела, сертификат ЕС и пункт ввоза BER: въезд с животным из ЕС и из других стран, включая Россию, Украину и Турцию.", alternates: { canonical: "/berlin/pereezd-s-zhivotnym" } };
export default function PetMovePage() { return <><GuidedRoute id="petmove" /><RouteJsonLd meta={metadata} /></>; }
