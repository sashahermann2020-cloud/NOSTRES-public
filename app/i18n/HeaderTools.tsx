"use client";

import InstallButton from "../InstallButton";
import ShareButton from "../ShareButton";
import LanguageSwitcher from "./LanguageSwitcher";

/** Правая часть шапки: установить, поделиться и выбор языка. */
export default function HeaderTools() {
  return <div className="header-tools"><InstallButton /><ShareButton /><LanguageSwitcher /></div>;
}
