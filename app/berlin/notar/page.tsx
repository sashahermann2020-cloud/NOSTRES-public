import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Нотариус в Берлине: поиск по языку и стоимость | NOSTRES",
  description: "Как найти нотариуса в Берлине, который говорит на вашем языке, почему цена по закону GNotKG у всех одна и сколько стоит учреждение GmbH или UG.",
  alternates: { canonical: "/berlin/notar" },
};

export default function NotarPage() {
  return <><GuidedRoute id="notary" /><RouteJsonLd meta={metadata} /></>;
}
