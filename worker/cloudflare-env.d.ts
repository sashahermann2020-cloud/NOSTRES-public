// Привязки, которые сборка добавляет в dist/server/wrangler.json (база D1 и статические файлы).
// Типы среды Cloudflare создаёт `npm run typecheck` (wrangler types) в worker-configuration.d.ts; файл не хранится в репозитории.
declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    ASSETS?: Fetcher;
  }
}
