import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "GmbH или UG в Берлине: учреждение и налоговый номер | NOSTRES",
  description: "Как учредить GmbH или UG в Берлине: капитал, договор у нотариуса, Handelsregister, Gewerbe, налоговая анкета в ELSTER, Transparenzregister, отчётность.",
  alternates: { canonical: "/berlin/gmbh-ug" },
};

export default function GmbhUgPage() {
  return <><GuidedRoute id="company" /><RouteJsonLd meta={metadata} /></>;
}
