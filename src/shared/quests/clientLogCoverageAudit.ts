import { detectAreaFromClientLogLine, matchDetectedArea, type AreaDefinition } from './areaMatcher';
import type { AreaChecklist } from './checklist';

export interface ClientLogCoverageEntry {
  token: string;
  count: number;
  examples: string[];
}

export interface ClientLogAreaCoverageReport {
  totalAreaTokens: number;
  matchedAreaIds: string[];
  unmatchedTokens: ClientLogCoverageEntry[];
  matchedAreasWithoutChecklist: ClientLogCoverageEntry[];
}

const HIDEOUT_OR_NON_CAMPAIGN_PATTERNS = [/은신처/u, /^hideout/iu];

export function auditClientLogAreaCoverage(
  lines: string[],
  areas: AreaDefinition[],
  checklists: AreaChecklist[]
): ClientLogAreaCoverageReport {
  const checklistAreaIds = new Set(checklists.map((checklist) => checklist.areaId));
  const tokenCounts = new Map<string, { count: number; examples: string[] }>();
  const matchedAreaIds = new Set<string>();
  const unmatched = new Map<string, { count: number; examples: string[] }>();
  const matchedWithoutChecklist = new Map<string, { count: number; examples: string[] }>();

  for (const line of lines) {
    const token = detectAreaFromClientLogLine(line);
    if (token == null || shouldIgnoreCoverageToken(token)) continue;
    addOccurrence(tokenCounts, token, line);

    const matched = matchDetectedArea(token, areas);
    if (matched.areaId == null || matched.confidence === 'low') {
      addOccurrence(unmatched, token, line);
      continue;
    }

    matchedAreaIds.add(matched.areaId);
    if (!checklistAreaIds.has(matched.areaId)) {
      addOccurrence(matchedWithoutChecklist, matched.areaId, line);
    }
  }

  return {
    totalAreaTokens: tokenCounts.size,
    matchedAreaIds: [...matchedAreaIds].sort(),
    unmatchedTokens: toEntries(unmatched),
    matchedAreasWithoutChecklist: toEntries(matchedWithoutChecklist)
  };
}

function addOccurrence(map: Map<string, { count: number; examples: string[] }>, key: string, line: string): void {
  const entry = map.get(key) ?? { count: 0, examples: [] };
  entry.count += 1;
  if (entry.examples.length < 3) entry.examples.push(line);
  map.set(key, entry);
}

function toEntries(map: Map<string, { count: number; examples: string[] }>): ClientLogCoverageEntry[] {
  return [...map.entries()]
    .map(([token, value]) => ({ token, count: value.count, examples: value.examples }))
    .sort((a, b) => b.count - a.count || a.token.localeCompare(b.token, 'ko-KR'));
}

function shouldIgnoreCoverageToken(token: string): boolean {
  const trimmed = token.trim();
  if (trimmed.length === 0) return true;
  if (/^\d+\s*장$/u.test(trimmed)) return true;
  if (/^act\s*\d+$/iu.test(trimmed)) return true;
  if (HIDEOUT_OR_NON_CAMPAIGN_PATTERNS.some((pattern) => pattern.test(trimmed))) return true;
  return false;
}
