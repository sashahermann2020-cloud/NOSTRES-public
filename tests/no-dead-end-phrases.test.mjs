import test from "node:test";
import assert from "node:assert/strict";
import { journeys, getVisibleQuestions, getPersonalizedResult } from "../app/nostres-data.ts";

// Правило спецификации §3.1: результат – это конкретный вывод со ссылкой, а не «уточните»/«сверьте»/«недостаточно данных».
const forbidden = /(уточните|сверьте|спросите|узнайте у|недостаточно данных|пока не подтвержд)/i;

test("every personalized result of every journey is concrete and has an official link", () => {
  let combos = 0;
  for (const journey of journeys) {
    const walk = (answers, depth) => {
      const question = getVisibleQuestions(journey, answers).find((item) => !answers[item.id]);
      if (!question || depth > 9) {
        combos += 1;
        const result = getPersonalizedResult(journey.id, answers);
        if (!result) return;
        const text = `${result.title} ${result.text}`;
        assert.doesNotMatch(text, forbidden, `${journey.id} ${JSON.stringify(answers)}`);
        assert.ok(result.actionUrl, `${journey.id} has no link for ${JSON.stringify(answers)}`);
        return;
      }
      for (const option of question.options) walk({ ...answers, [question.id]: option.value }, depth + 1);
    };
    walk({}, 0);
  }
  assert.ok(combos > 100);
});

// Тот же запрет для всего исходного текста интерфейса, а не только итогов сценариев `nostres-data.ts`:
// строки шагов, заголовки и пояснения в app/**. Включена и форма «сверяйте» того же глагола.
test("no source file of the interface sends the user to find something out", async () => {
  const { readdir, readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const root = new URL("../app/", import.meta.url).pathname;
  const sourceForbidden = /(уточните|сверьте|сверяйте|спросите|узнайте у|недостаточно данных)/i;
  const hits = [];
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (/\.(ts|tsx)$/.test(entry.name)) {
        (await readFile(path, "utf8")).split("\n").forEach((line, index) => {
          if (sourceForbidden.test(line)) hits.push(`${path.slice(root.length)}:${index + 1}`);
        });
      }
    }
  };
  await walk(root);
  assert.deepEqual(hits, [], `запрещённые обороты в ${hits.join(", ")}`);
});
