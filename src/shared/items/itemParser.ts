export interface ParsedItemText {
  rawText: string;
  rawLines: string[];
  rarity?: string;
  name?: string;
  baseType?: string;
  itemLevel?: number;
  requirements: string[];
  stats: string[];
  mods: string[];
  unknownLines: string[];
}

const SECTION_SEPARATOR = /^-+$/;
const RARITY_PREFIXES = [/^Rarity:\s*(.+)$/i, /^희귀도:\s*(.+)$/];
const ITEM_LEVEL_PREFIXES = [/^Item Level:\s*(\d+)$/i, /^아이템 레벨:\s*(\d+)$/];
const REQUIREMENTS_HEADERS = new Set(['Requirements:', '요구사항:']);
const EXPLICIT_STAT_PREFIXES = [
  /^Quality:/i,
  /^Armour:/i,
  /^Evasion Rating:/i,
  /^Energy Shield:/i,
  /^Ward:/i,
  /^Block:/i,
  /^Physical Damage:/i,
  /^Elemental Damage:/i,
  /^Critical Hit Chance:/i,
  /^Attacks per Second:/i,
  /^방어도:/,
  /^회피:/,
  /^에너지 보호막:/,
  /^퀄리티:/,
  /^물리 피해:/,
  /^원소 피해:/,
  /^치명타 확률:/,
  /^초당 공격 횟수:/
];

export function parseCopiedItemText(rawText: string): ParsedItemText {
  const rawLines = normalizeLines(rawText);
  const parsed: ParsedItemText = {
    rawText,
    rawLines,
    requirements: [],
    stats: [],
    mods: [],
    unknownLines: []
  };

  const contentLines = rawLines.filter((line) => !SECTION_SEPARATOR.test(line));
  let cursor = 0;

  while (cursor < contentLines.length) {
    const rarity = parsePrefixedValue(contentLines[cursor], RARITY_PREFIXES);
    if (rarity != null) {
      parsed.rarity = rarity;
      cursor += 1;
      break;
    }
    cursor += 1;
  }

  const headerLines: string[] = [];
  while (cursor < contentLines.length) {
    const line = contentLines[cursor];
    if (isMetadataLine(line) || REQUIREMENTS_HEADERS.has(line) || isExplicitStatLine(line)) break;
    headerLines.push(line);
    cursor += 1;
    if (headerLines.length >= 2) break;
  }

  if (headerLines.length > 0) parsed.name = headerLines[0];
  if (headerLines.length > 1) parsed.baseType = headerLines[1];
  if (parsed.name == null && rawLines.length > 0 && !SECTION_SEPARATOR.test(rawLines[0]) && !isMetadataLine(rawLines[0])) {
    parsed.name = rawLines[0];
  }

  const sections = splitSections(rawLines);
  const firstStatSectionIndex = parsed.rarity == null ? Number.POSITIVE_INFINITY : 2;

  for (let index = 0; index < sections.length; index += 1) {
    const section = sections[index];
    if (section.length === 0) continue;

    const itemLevelLine = section.find((line) => parseItemLevel(line) != null);
    if (itemLevelLine != null) parsed.itemLevel = parseItemLevel(itemLevelLine);

    const requirementHeaderIndex = section.findIndex((line) => REQUIREMENTS_HEADERS.has(line));
    if (requirementHeaderIndex >= 0) {
      parsed.requirements.push(
        ...section.slice(requirementHeaderIndex + 1).filter((line) => !isMetadataLine(line))
      );
      continue;
    }

    const nonMetadata = section.filter((line) => !isHeaderLine(line, parsed) && !isMetadataLine(line));
    if (nonMetadata.length === 0) continue;

    if (index === firstStatSectionIndex || nonMetadata.every(isExplicitStatLine)) {
      parsed.stats.push(...nonMetadata);
    } else if (index > firstStatSectionIndex) {
      parsed.mods.push(...nonMetadata);
    } else if (parsed.rarity == null) {
      parsed.unknownLines.push(...nonMetadata);
    }
  }

  if (parsed.rarity == null) {
    const known = new Set([parsed.name, parsed.baseType, ...parsed.requirements, ...parsed.stats, ...parsed.mods].filter(Boolean));
    for (const line of rawLines) {
      if (!SECTION_SEPARATOR.test(line) && !known.has(line) && !isMetadataLine(line)) parsed.unknownLines.push(line);
    }
    parsed.unknownLines = Array.from(new Set(parsed.unknownLines));
  }

  return parsed;
}

function normalizeLines(rawText: string): string[] {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function splitSections(lines: string[]): string[][] {
  const sections: string[][] = [[]];
  for (const line of lines) {
    if (SECTION_SEPARATOR.test(line)) {
      sections.push([]);
    } else {
      sections[sections.length - 1].push(line);
    }
  }
  return sections;
}

function parsePrefixedValue(line: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match?.[1] != null) return match[1].trim();
  }
  return undefined;
}

function parseItemLevel(line: string): number | undefined {
  const value = parsePrefixedValue(line, ITEM_LEVEL_PREFIXES);
  if (value == null) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isMetadataLine(line: string): boolean {
  return parsePrefixedValue(line, RARITY_PREFIXES) != null || parseItemLevel(line) != null || /^Item Class:/i.test(line) || /^아이템 종류:/.test(line);
}

function isExplicitStatLine(line: string): boolean {
  return EXPLICIT_STAT_PREFIXES.some((pattern) => pattern.test(line));
}

function isHeaderLine(line: string, parsed: ParsedItemText): boolean {
  return line === parsed.name || line === parsed.baseType;
}
