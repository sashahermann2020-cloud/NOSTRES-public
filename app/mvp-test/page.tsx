import type { Metadata } from "next";
import MvpTestBody from "./MvpTestBody";

export const metadata: Metadata = { title: "Тестирование маршрутов | NOSTRES", robots: { index: false, follow: true } };

export default function MvpTestPage() {
  return (
    <main className="test-page" id="top" tabIndex={-1}>
      <MvpTestBody />
    </main>
  );
}
