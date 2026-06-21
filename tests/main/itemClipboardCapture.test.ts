import { describe, expect, it, vi } from 'vitest';
import { captureCopiedItemText } from '../../src/main/clipboard/itemClipboardCapture';

describe('captureCopiedItemText', () => {
  it('saves and restores the previous clipboard around a user-triggered copy request', async () => {
    let clipboardText = 'previous clipboard';
    const requestCopy = vi.fn(async () => {
      clipboardText = 'Rarity: Normal\nDriftwood Wand\n--------\nItem Level: 2';
    });

    const result = await captureCopiedItemText({
      readText: () => clipboardText,
      writeText: (text) => {
        clipboardText = text;
      },
      requestCopy,
      waitMs: async () => undefined,
      timeoutMs: 50,
      pollIntervalMs: 1
    });

    expect(requestCopy).toHaveBeenCalledOnce();
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected capture success');
    expect(result.rawText).toContain('Driftwood Wand');
    expect(result.parsed?.name).toBe('Driftwood Wand');
    expect(clipboardText).toBe('previous clipboard');
  });

  it('restores clipboard and returns an unavailable result when copied text never arrives', async () => {
    let clipboardText = 'keep me';

    const result = await captureCopiedItemText({
      readText: () => clipboardText,
      writeText: (text) => {
        clipboardText = text;
      },
      requestCopy: vi.fn(async () => undefined),
      waitMs: async () => undefined,
      timeoutMs: 3,
      pollIntervalMs: 1
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected capture failure');
    expect(result.reason).toBe('no-item-text');
    expect(clipboardText).toBe('keep me');
  });

  it('restores clipboard even when the copy request throws', async () => {
    let clipboardText = 'safe previous';

    const result = await captureCopiedItemText({
      readText: () => clipboardText,
      writeText: (text) => {
        clipboardText = text;
      },
      requestCopy: vi.fn(async () => {
        throw new Error('copy failed');
      }),
      waitMs: async () => undefined,
      timeoutMs: 3,
      pollIntervalMs: 1
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected capture failure');
    expect(result.reason).toBe('copy-failed');
    expect(clipboardText).toBe('safe previous');
  });
});
