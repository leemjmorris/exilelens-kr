import { describe, expect, it } from 'vitest';
import { buildClientLogPathCandidates } from '../../src/shared/settings/clientLogDiscovery';

describe('clientLogDiscovery', () => {
  it('includes Korean KakaoGames, Daum, Documents, Steam, GGG, and Epic Client.txt candidates', () => {
    const candidates = buildClientLogPathCandidates('C:\\Users\\happy\\Documents');

    expect(candidates).toContain('C:\\Kakaogames\\Path of Exile2\\logs\\KakaoClient.txt');
    expect(candidates).toContain('C:\\Daum Games\\Path of Exile2\\logs\\KakaoClient.txt');
    expect(candidates).toContain('C:\\Users\\happy\\Documents\\My Games\\Path of Exile 2\\logs\\Client.txt');
    expect(candidates.some((candidate) => candidate.includes('Steam') && candidate.endsWith('Client.txt'))).toBe(true);
    expect(candidates.some((candidate) => candidate.includes('Grinding Gear Games') && candidate.endsWith('Client.txt'))).toBe(true);
    expect(candidates.some((candidate) => candidate.includes('Epic Games') && candidate.endsWith('Client.txt'))).toBe(true);
  });
});
