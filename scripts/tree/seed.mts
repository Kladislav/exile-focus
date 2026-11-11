// Генерирует данные пассивного дерева для web/src/tree/data/<версия>.json
// из официального экспорта GGG (grindinggear/skilltree-export), используя
// сборщик из upstream (seeding/src/build-tree). Файлы не коммитятся:
// их собирает CI и `npm run seed-tree` локально.
import fs from "node:fs";
import path from "node:path";
import { buildTemplates } from "../../upstream/seeding/src/build-tree/index.ts";

const out = path.resolve(import.meta.dirname, "../../web/src/tree/data");
fs.mkdirSync(out, { recursive: true });

for (const { version, skillTree } of await buildTemplates()) {
  const file = path.join(out, `${version}.json`);
  fs.writeFileSync(file, JSON.stringify(skillTree));
  console.log(version, `${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}
