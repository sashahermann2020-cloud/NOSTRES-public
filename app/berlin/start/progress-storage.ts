import type { StartingAnswers } from "./plan";

export const START_PROGRESS_KEY = "nostres-berlin-plan-v1";

export type StartProgress = {
  answers: Partial<StartingAnswers>;
  stage: number;
  confirmed: string[];
  checkedAt: string;
};

type StorageApi = Pick<Storage, "getItem" | "setItem">;

export function loadStartProgress(storage?: StorageApi): StartProgress | null {
  try {
    const target = storage ?? window.localStorage;
    const raw = target.getItem(START_PROGRESS_KEY);
    if (!raw) return null;
    const saved: Partial<StartProgress> = JSON.parse(raw);
    if (!saved.answers || typeof saved.answers !== "object" || Array.isArray(saved.answers)) return null;
    return {
      answers: saved.answers,
      stage: Number.isInteger(saved.stage) && saved.stage! >= 0 && saved.stage! <= 3 ? saved.stage! : 0,
      confirmed: Array.isArray(saved.confirmed) ? saved.confirmed.filter((id): id is string => typeof id === "string") : [],
      checkedAt: typeof saved.checkedAt === "string" ? saved.checkedAt : "",
    };
  } catch {
    return null;
  }
}

export function saveStartProgress(progress: Omit<StartProgress, "checkedAt"> & { checkedAt?: string }, storage?: StorageApi): boolean {
  try {
    const target = storage ?? window.localStorage;
    target.setItem(START_PROGRESS_KEY, JSON.stringify({ ...progress, checkedAt: progress.checkedAt ?? new Date().toISOString() }));
    return true;
  } catch {
    return false;
  }
}
