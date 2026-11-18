import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Виза для волонтёров: BFD, FSJ, FÖJ и ESC | NOSTRES",
  description: "Как найти место волонтёрской службы в Германии, какие условия по возрасту и какие документы нужны для визы или разрешения в Берлине.",
  alternates: { canonical: "/berlin/viza-volontyor" },
};

export default function VizaVolontyorPage() {
  return <><GuidedRoute id="volunteer" /><RouteJsonLd meta={metadata} /></>;
}
