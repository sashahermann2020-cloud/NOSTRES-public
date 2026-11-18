import type { Metadata } from "next";
import TopicPage from "../TopicPage";
import { topics } from "../topics";

export const metadata: Metadata = { title: `${topics.family.title} | NOSTRES`, description: topics.family.description, alternates: { canonical: topics.family.path }, openGraph: { title: topics.family.title, description: topics.family.description, url: topics.family.path, type: "article", images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NOSTRES: самостоятельные планы действий и официальные источники" }] } };
export default function Page() { return <TopicPage topic={topics.family} />; }
