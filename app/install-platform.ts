/** Какую подсказку по установке показать: iPhone/iPad, Safari на Mac или остальные браузеры. */
export type InstallPlatform = "ios" | "mac-safari" | "other";

export function detectPlatform(userAgent: string, platform: string, maxTouchPoints: number): InstallPlatform {
  // iPad на iPadOS представляется как Mac, но у него есть сенсорный экран.
  if (/iPhone|iPad|iPod/.test(userAgent) || (platform === "MacIntel" && maxTouchPoints > 1)) return "ios";
  if (/Macintosh/.test(userAgent) && /Safari\//.test(userAgent) && !/Chrome|Chromium|CriOS|Edg|Firefox|FxiOS|OPR/.test(userAgent)) return "mac-safari";
  return "other";
}
