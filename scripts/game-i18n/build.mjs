// Собирает web/src/i18n/game-ru.json: русские названия из файлов игры.
//
//   cd scripts/game-i18n
//   npx pathofexile-dat     # выгружает tables/{English,Russian} по config.json
//   node build.mjs
//
// Английские и русские таблицы совпадают построчно, поэтому перевод
// строится сопоставлением строк по индексу.

import fs from "node:fs";
import path from "node:path";

const here = import.meta.dirname;
const root = path.resolve(here, "../..");
const commonData = path.join(root, "upstream/common/data");
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const table = (lang, name) => readJson(path.join(here, "tables", lang, `${name}.json`));

// В русских строках бывает разметка склонений:
// "<if:gen>{Побережья}<else>{Побережье}". Берём именительный падеж.
function clean(value) {
  if (!value) return value;
  value = value.trim();
  if (/\{\d+\}/.test(value)) return null; // шаблоны вида "{0} ..."
  if (!value.includes("{")) return value;
  const m = /<else>\{([^}]*)\}/.exec(value) ?? /\{([^}]*)\}/.exec(value);
  return m ? m[1].trim() : value;
}

function rows(name) {
  const en = table("English", name);
  const ru = table("Russian", name);
  return en.map((row, i) => [row, ru[i]]);
}

function byId(name) {
  const map = new Map();
  for (const [en, ru] of rows(name)) {
    const v = clean(ru?.Name);
    if (v) map.set(en.Id, v);
  }
  return map;
}

// Английское название -> русское, источники по приоритету.
const TEXT_SOURCES = [
  ["MonsterVarieties", "Name"],
  ["NPCs", "Name"],
  ["NPCs", "ShortName"],
  ["BaseItemTypes", "Name"],
  ["WorldAreas", "Name"],
  ["Chests", "Name"],
  ["ClientStrings", "Text"],
  ["Characters", "Name"],
  ["MapPins", "Name"],
  ["Quest", "Name"],
  ["Labyrinths", "Name"],
  ["PantheonPanelLayout", "GodName1"],
  ["PantheonPanelLayout", "GodName2"],
  ["PantheonPanelLayout", "GodName3"],
  ["PantheonPanelLayout", "GodName4"],
];
const textIndex = new Map();
for (const [name, col] of TEXT_SOURCES) {
  for (const [en, ru] of rows(name)) {
    const key = en[col]?.trim();
    const value = clean(ru?.[col]);
    if (!key || !value || textIndex.has(key)) continue;
    textIndex.set(key, value);
  }
}
const lowerIndex = new Map([...textIndex].map(([k, v]) => [k.toLowerCase(), v]));
const lookupText = (en) => textIndex.get(en) ?? lowerIndex.get(en.toLowerCase());

const areas = readJson(path.join(commonData, "json/areas.json"));
const quests = readJson(path.join(commonData, "json/quests.json"));
const gems = readJson(path.join(commonData, "json/gems.json"));
const characters = readJson(path.join(commonData, "json/characters.json"));
const manual = readJson(path.join(here, "manual-ru.json"));

const areaNames = byId("WorldAreas");
const questNames = byId("Quest");
const itemNames = byId("BaseItemTypes");

const pick = (ids, source) =>
  Object.fromEntries(ids.filter((id) => source.has(id)).map((id) => [id, source.get(id)]));

// Термины из маршрута, которые показываются на языке игры.
const terms = new Set();
// Маршрут свой (web/src/route/routes), в нём есть термины, которых нет у upstream.
const routesDir = path.join(root, "web/src/route/routes");
for (const file of fs.readdirSync(routesDir).filter((f) => f.endsWith(".txt"))) {
  const src = fs.readFileSync(path.join(routesDir, file), "utf8");
  for (const m of src.matchAll(/\{(kill|arena|quest_text|generic)\|([^}]*)\}/g)) terms.add(m[2]);
}
for (const quest of Object.values(quests))
  for (const offer of Object.values(quest.reward_offers)) if (offer?.quest_npc) terms.add(offer.quest_npc);
for (const name of Object.keys(characters)) terms.add(name);
for (const area of Object.values(areas)) for (const r of area.crafting_recipes) terms.add(r);
// Общие игровые понятия, которые рендерит интерфейс.
["Waypoint", "Portal", "Trial of Ascendancy", "The Labyrinth", "The Cruel Labyrinth", "The Merciless Labyrinth", "The Eternal Labyrinth"].forEach((t) => terms.add(t));

const text = {};
const missing = [];
for (const term of [...terms].sort()) {
  const value = manual[term] ?? lookupText(term);
  if (value) text[term] = value;
  else missing.push(term);
}

const out = {
  areas: pick(Object.keys(areas), areaNames),
  quests: pick(Object.keys(quests), questNames),
  gems: pick(Object.keys(gems), itemNames),
  text,
};

const outPath = path.join(root, "web/src/i18n/game-ru.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + "\n");

console.log(
  `areas ${Object.keys(out.areas).length}/${Object.keys(areas).length},`,
  `quests ${Object.keys(out.quests).length}/${Object.keys(quests).length},`,
  `gems ${Object.keys(out.gems).length}/${Object.keys(gems).length},`,
  `text ${Object.keys(text).length}/${terms.size}`,
);
if (missing.length) console.log("missing:", missing.join(" | "));
