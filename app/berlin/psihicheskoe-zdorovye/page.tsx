import type { Metadata } from "next";
import RouteJsonLd from "../RouteJsonLd";
import GuidedRoute from "../new-routes/GuidedRoute";

export const metadata: Metadata = {
  title: "Психическое здоровье в Берлине: кризис, психиатр, психотерапия | NOSTRES",
  description: "Помощь в Берлине: Krisendienst без записи и без звонка, психиатр, психотерапия, поддержка близких и пропуск встречи в Jobcenter.",
  alternates: { canonical: "/berlin/psihicheskoe-zdorovye" },
};

export default function MentalHealthPage() {
  return <><GuidedRoute id="mental" /><RouteJsonLd meta={metadata} /></>;
}
