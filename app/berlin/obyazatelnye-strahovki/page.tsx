import type { Metadata } from "next";
import TopicPage from "../TopicPage";
import { topics } from "../topics";

export const metadata: Metadata = { title: `${topics.insurance.title} | NOSTRES`, description: topics.insurance.description, alternates: { canonical: topics.insurance.path }, openGraph: { title: topics.insurance.title, description: topics.insurance.description, url: topics.insurance.path, type: "article", images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NOSTRES — самостоятельные планы действий и официальные источники" }] } };
export default function Page() { return <TopicPage topic={topics.insurance} />; }
