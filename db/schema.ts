import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const productEvents = sqliteTable("product_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventName: text("event_name").notNull(),
  routeId: text("route_id").notNull(),
  methodId: text("method_id"),
  elementId: text("element_id"),
  stepIndex: integer("step_index"),
  problemCode: text("problem_code"),
  attemptId: text("attempt_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_product_events_route_event_created").on(table.routeId, table.eventName, table.createdAt),
  index("idx_product_events_attempt").on(table.attemptId),
]);

export const issueReports = sqliteTable("issue_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  routeId: text("route_id").notNull(),
  methodId: text("method_id"),
  stepIndex: integer("step_index"),
  sourceId: text("source_id"),
  issueType: text("issue_type").notNull(),
  attemptId: text("attempt_id").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_issue_reports_status_created").on(table.status, table.createdAt),
  index("idx_issue_reports_attempt").on(table.attemptId),
]);

export const routeFeedback = sqliteTable("route_feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  routeId: text("route_id").notNull(),
  methodId: text("method_id"),
  outcome: text("outcome"),
  clarityRating: integer("clarity_rating").notNull(),
  nextActionStatus: text("next_action_status").notNull(),
  officialActionStatus: text("official_action_status").notNull(),
  blockerCode: text("blocker_code").notNull().default("none"),
  attemptId: text("attempt_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_route_feedback_route_created").on(table.routeId, table.createdAt),
  index("idx_route_feedback_attempt").on(table.attemptId),
]);
