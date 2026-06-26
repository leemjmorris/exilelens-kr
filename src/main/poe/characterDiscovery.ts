export function extractCharacterNamesFromClientLogLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const line of lines) {
    const name = extractCharacterNameFromRewardLine(line);
    if (name == null || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }

  return names;
}

function extractCharacterNameFromRewardLine(line: string): string | null {
  if (!line.includes('님이') || !line.includes('획득했습니다')) return null;
  const match = line.match(/:\s*(?<name>[^:\[\]]+?)\s*님이\s+.+?획득했습니다/u);
  const name = match?.groups?.name?.trim();
  return name != null && name.length > 0 ? name : null;
}
