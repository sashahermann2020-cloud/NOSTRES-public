import type { ReactNode } from "react";
import Link from "./i18n/link";
import { APP_VERSION } from "./version";
import ShareButton from "./ShareButton";
import InstallButton from "./InstallButton";
import HeaderTools from "./i18n/HeaderTools";
import Translated from "./i18n/Translated";

export function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Translated>
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true" data-mark="N" />
          <span className="brand-copy"><b>NOSTRES</b><small>Понятный путь</small></span>
        </Link>
        <nav className="info-nav" aria-label="Разделы сайта">
          <Link href="/contact">Контакты</Link>
          <Link href="/privacy">Конфиденциальность</Link>
          <Link href="/about">О проекте</Link>
        </nav>
        <HeaderTools />
      </header>
      <main className="section info-content" id="top" tabIndex={-1}>
        <p className="overline">NOSTRES · Понятный путь после переезда · первый город Берлин</p>
        <h1>{title}</h1>
        <div className="info-body">{children}</div>
        <p><Link className="official-secondary" href="/">← На главную NOSTRES</Link></p>
      </main>
      <footer className="site-footer info-footer">
        <Link className="brand footer-brand" href="/">
          <span className="brand-mark" aria-hidden="true" data-mark="N" />
          <span className="brand-copy"><b>NOSTRES</b><small>Понятный путь</small></span>
        </Link>
        <nav className="footer-links" aria-label="Информация о проекте">
          <ShareButton variant="link" />
          <InstallButton variant="link" />
          <Link href="/contact">Контакты</Link>
          <Link href="/privacy">Конфиденциальность</Link>
          <Link href="/about">О проекте</Link>
          <span className="app-version">{APP_VERSION}</span>
        </nav>
      </footer>
    </Translated>
  );
}
