-- Индексы по attempt_id для /api/mvp-events (аудит 12.11.2026, находка H1).
-- Без них проверка «сколько записей у этой попытки» читает всю таблицу при каждом запросе.
-- Безопасно выполнять повторно (IF NOT EXISTS); данные не изменяются, таблицы не пересоздаются.
-- Применяется к production D1 только после явного согласия владельца:
--   npx wrangler d1 execute nostres --remote --file=db/migrations/2026-11-12-attempt-id-indexes.sql
CREATE INDEX IF NOT EXISTS `idx_product_events_attempt` ON `product_events` (`attempt_id`);
CREATE INDEX IF NOT EXISTS `idx_issue_reports_attempt` ON `issue_reports` (`attempt_id`);
CREATE INDEX IF NOT EXISTS `idx_route_feedback_attempt` ON `route_feedback` (`attempt_id`);
