import type { PlanItem } from "./plan";

// Which routes must be finished first. Applies only when the earlier route is also in the personal plan.
export const dependencies: Record<string, string[]> = {
  anmeldung: ["housing"],
  "tax-id": ["anmeldung", "address-check"],
  doctor: ["health"],
};

export function blockers(item: PlanItem, plan: PlanItem[], isDone: (item: PlanItem) => boolean): PlanItem[] {
  const needed = dependencies[item.id] ?? [];
  return plan.filter((other) => needed.includes(other.id) && !isDone(other));
}

// First open item that can be started now; items that need a check come after items ready to start.
export function nextStep(plan: PlanItem[], isDone: (item: PlanItem) => boolean): PlanItem | null {
  const open = plan.filter((item) => !isDone(item) && blockers(item, plan, isDone).length === 0);
  // "after" items are ready once the earlier route they depend on (which is in this plan) is finished.
  const ready = (item: PlanItem) => item.sequence === "now" || (item.sequence === "after" && (dependencies[item.id] ?? []).some((id) => plan.some((other) => other.id === id)));
  return open.find(ready) ?? open.find((item) => item.sequence === "check") ?? null;
}

export function waiting(plan: PlanItem[], isDone: (item: PlanItem) => boolean): { item: PlanItem; blockedBy: PlanItem[] }[] {
  return plan
    .filter((item) => !isDone(item))
    .map((item) => ({ item, blockedBy: blockers(item, plan, isDone) }))
    .filter((entry) => entry.blockedBy.length > 0);
}
