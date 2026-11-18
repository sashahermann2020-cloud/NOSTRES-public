// Срок хранения технических событий: записи старше RETENTION_MONTHS месяцев удаляются.
// Касается таблиц product_events, issue_reports и route_feedback (см. политику приватности).
// Запускается из cron-обработчика Worker раз в сутки; модуль не имеет зависимостей, чтобы его
// можно было проверить в Node.

export const RETENTION_MONTHS = 12;
/** Строк в одном запросе DELETE. */
export const PURGE_BATCH = 2000;
/** Запросов на таблицу за запуск: потолок 20 000 удалённых строк, чтобы не исчерпать дневной лимит записей D1. */
export const PURGE_MAX_BATCHES = 10;
/** Час (UTC), в который выполняется очистка; cron работает каждые 15 минут, очистка – в первое окно этого часа. */
export const PURGE_HOUR_UTC = 3;

const TABLES = ["product_events", "issue_reports", "route_feedback"] as const;

interface PurgeDb {
  prepare(sql: string): { bind(...values: unknown[]): { run(): Promise<{ meta?: { changes?: number } }> } };
}

/** Граница хранения в формате CURRENT_TIMESTAMP из SQLite (`YYYY-MM-DD HH:MM:SS`, UTC). */
export function retentionCutoff(now: Date, months = RETENTION_MONTHS): string {
  const cutoff = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - months,
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
    ),
  );
  return cutoff.toISOString().slice(0, 19).replace("T", " ");
}

/** Очистка запускается один раз в сутки: в первом 15-минутном окне часа PURGE_HOUR_UTC. */
export function isPurgeWindow(scheduledTime: number): boolean {
  const at = new Date(scheduledTime);
  return at.getUTCHours() === PURGE_HOUR_UTC && at.getUTCMinutes() < 15;
}

export async function purgeExpired(
  db: PurgeDb,
  now: Date,
  options: { months?: number; batch?: number; maxBatches?: number } = {},
): Promise<Record<string, number>> {
  const cutoff = retentionCutoff(now, options.months ?? RETENTION_MONTHS);
  const batch = options.batch ?? PURGE_BATCH;
  const maxBatches = options.maxBatches ?? PURGE_MAX_BATCHES;
  const deleted: Record<string, number> = {};
  for (const table of TABLES) {
    deleted[table] = 0;
    for (let i = 0; i < maxBatches; i += 1) {
      const result = await db
        .prepare(`DELETE FROM ${table} WHERE id IN (SELECT id FROM ${table} WHERE created_at < ? ORDER BY id LIMIT ?)`)
        .bind(cutoff, batch)
        .run();
      const changes = result.meta?.changes ?? 0;
      deleted[table] += changes;
      if (changes < batch) break;
    }
  }
  return deleted;
}
