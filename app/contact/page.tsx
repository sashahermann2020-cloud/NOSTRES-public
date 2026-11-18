import type { Metadata } from "next";
import { InfoPage } from "../info-page";

export const metadata: Metadata = {
  title: "Контакты NOSTRES",
  description: "Связаться с автором независимого информационного проекта NOSTRES.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <InfoPage title="Контакты">
    <p>NOSTRES: независимый информационный проект из Италии.</p>
    <p><strong>Автор проекта:</strong> Александра Герман</p>
    <p><strong>Электронная почта:</strong> <a href="mailto:alexandra.hermann@nostres.world">alexandra.hermann@nostres.world</a></p>
    <p>Чтобы отправить вопрос или замечание, напишите на этот адрес. NOSTRES не запрашивает имя или email в интерфейсе сайта.</p>
  </InfoPage>;
}
