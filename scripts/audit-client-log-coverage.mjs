import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const defaultLogPath = 'C:/Kakaogames/Path of Exile2/logs/KakaoClient.txt';
const logPath = process.argv[2] ?? process.env.POE2_CLIENT_LOG ?? defaultLogPath;
const dataDir = path.join(repoRoot, 'src/shared/quests/data');

const scenePattern = /\[SCENE\]\s+Set Source\s+\[(.+?)\]/iu;
const loadingPattern = /\[LOADING SCREEN\]\s+\((.*?)\)/iu;
const codePattern = /Generating level\s+\d+\s+area\s+"([^"]+)"/iu;

const ignorePatterns = [/^\d+\s*장$/u, /^act\s*\d+$/iu, /^\(null\)$/iu, /^null$/iu, /^\(unknown\)$/iu, /^unknown$/iu, /은신처/u, /^hideout/iu];

function readQuestDataSource() {
  return fs
    .readdirSync(dataDir)
    .filter((name) => /^(act\d+|interlude|index)\.ts$/.test(name))
    .map((name) => fs.readFileSync(path.join(dataDir, name), 'utf8'))
    .join('\n');
}

function parseList(listSource = '') {
  return [...listSource.matchAll(/'([^']+)'|"([^"]+)"/g)].map((match) => match[1] ?? match[2]);
}

function parseAreas(source) {
  const areas = [];
  const areaPattern = /\{[^}]*id: '([^']+)'[^}]*nameKo: '([^']+)'[^}]*nameEn: ([^,]+)[^}]*logNamesKo: \[([^\]]*)\][^}]*\}/g;
  for (const match of source.matchAll(areaPattern)) {
    const block = match[0];
    const aliasMatch = /areaIdAliases: \[([^\]]*)\]/.exec(block);
    areas.push({
      id: match[1],
      nameKo: match[2],
      nameEn: parseList(match[3])[0] ?? '',
      names: new Set([match[1], match[2], ...parseList(match[3]), ...parseList(match[4])].filter(Boolean).map(normalize)),
      codes: new Set(parseList(aliasMatch?.[1]).map(normalize))
    });
  }
  return areas;
}

function parseChecklistAreaIds(source) {
  return new Set([...source.matchAll(/(?:objective|objectives)\('([^']+)'/g)].map((match) => match[1]));
}

function normalize(value) {
  return String(value).trim().toLocaleLowerCase('ko-KR');
}

function tokenFromLine(line) {
  return codePattern.exec(line)?.[1] ?? scenePattern.exec(line)?.[1] ?? loadingPattern.exec(line)?.[1] ?? null;
}

function shouldIgnore(token) {
  return ignorePatterns.some((pattern) => pattern.test(token.trim()));
}

function add(map, key, line) {
  const entry = map.get(key) ?? { count: 0, examples: [] };
  entry.count += 1;
  if (entry.examples.length < 2) entry.examples.push(line.slice(0, 260));
  map.set(key, entry);
}

function findArea(areas, token) {
  const normalized = normalize(token);
  return areas.find((area) => area.names.has(normalized) || area.codes.has(normalized));
}

if (!fs.existsSync(logPath)) {
  console.error(`Client log not found: ${logPath}`);
  process.exit(2);
}

const source = readQuestDataSource();
const areas = parseAreas(source);
const checklistAreaIds = parseChecklistAreaIds(source);
const lines = fs.readFileSync(logPath, 'utf8').split(/\r?\n/);
const unmatched = new Map();
const noChecklist = new Map();
const matched = new Set();
let totalTokens = 0;

for (const line of lines) {
  const token = tokenFromLine(line);
  if (!token || shouldIgnore(token)) continue;
  totalTokens += 1;
  const area = findArea(areas, token);
  if (!area) {
    add(unmatched, token, line);
    continue;
  }
  matched.add(area.id);
  if (!checklistAreaIds.has(area.id)) add(noChecklist, area.id, line);
}

function printMap(title, map) {
  console.log(`\n${title}: ${map.size}`);
  for (const [token, entry] of [...map.entries()].sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0], 'ko-KR'))) {
    console.log(`- ${token} (${entry.count})`);
    for (const example of entry.examples) console.log(`  ${example}`);
  }
}

console.log(`Client log: ${logPath}`);
console.log(`Area definitions: ${areas.length}`);
console.log(`Detected area tokens: ${totalTokens}`);
console.log(`Matched area ids: ${matched.size}`);
printMap('Unmatched tokens', unmatched);
printMap('Matched areas without checklist', noChecklist);

if (unmatched.size > 0 || noChecklist.size > 0) process.exitCode = 1;
