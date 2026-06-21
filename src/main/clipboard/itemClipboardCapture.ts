import { clipboard } from 'electron';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { parseCopiedItemText, type ParsedItemText } from '../../shared/items/itemParser';

const execFileAsync = promisify(execFile);

export interface ClipboardCaptureDeps {
  readText: () => string;
  writeText: (text: string) => void;
  requestCopy: () => Promise<void> | void;
  waitMs?: (milliseconds: number) => Promise<void>;
  timeoutMs?: number;
  pollIntervalMs?: number;
}

export type ClipboardCaptureResult =
  | { ok: true; rawText: string; parsed: ParsedItemText }
  | { ok: false; reason: 'copy-failed' | 'no-item-text'; rawText: string; error?: string };

export async function captureCopiedItemText(deps: ClipboardCaptureDeps): Promise<ClipboardCaptureResult> {
  const waitMs = deps.waitMs ?? defaultWaitMs;
  const timeoutMs = deps.timeoutMs ?? 700;
  const pollIntervalMs = deps.pollIntervalMs ?? 40;
  const previousText = deps.readText();

  try {
    deps.writeText('');
    await deps.requestCopy();

    const rawText = await waitForCopiedText(deps.readText, waitMs, timeoutMs, pollIntervalMs);
    if (rawText.trim().length === 0) {
      return { ok: false, reason: 'no-item-text', rawText: '' };
    }

    return { ok: true, rawText, parsed: parseCopiedItemText(rawText) };
  } catch (error) {
    return {
      ok: false,
      reason: 'copy-failed',
      rawText: deps.readText(),
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    deps.writeText(previousText);
  }
}

export function createElectronClipboardCaptureDeps(): ClipboardCaptureDeps {
  return {
    readText: () => clipboard.readText(),
    writeText: (text) => clipboard.writeText(text),
    requestCopy: requestActiveWindowCopy
  };
}

async function waitForCopiedText(
  readText: () => string,
  waitMs: (milliseconds: number) => Promise<void>,
  timeoutMs: number,
  pollIntervalMs: number
): Promise<string> {
  const started = Date.now();
  while (Date.now() - started <= timeoutMs) {
    const text = readText();
    if (text.trim().length > 0) return text;
    await waitMs(pollIntervalMs);
  }
  return readText();
}

function defaultWaitMs(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function requestActiveWindowCopy(): Promise<void> {
  if (process.platform !== 'win32') {
    throw new Error('Clipboard item capture currently supports Windows only; use manual paste instead.');
  }

  // Sends exactly one Ctrl+C copy request to the active window. No clicks, memory reads,
  // packet inspection, or gameplay automation are performed.
  await execFileAsync('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^c')"
  ], { windowsHide: true, timeout: 2000 });
}
