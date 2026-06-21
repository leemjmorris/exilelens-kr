# Known Issues / Verification Gaps

ExileLens KR is an MVP overlay. The following items are intentionally tracked before wider use:

- **Korean `Client.txt` fixtures needed**: area detection should be validated with real Korean POE2 `Client.txt` samples across acts, towns, hideouts, and relogs.
- **Act 1 Korean names need verification**: Act 1 seed data is expanded from public references and marked with `needsVerification`; quest labels and area names should be checked in the live Korean client.
- **Official trade query is not live-price verified**: the trade panel creates a safe manual-search draft only. It does not claim real-time prices and the exact POE2 official trade API/query semantics need live validation.
- **Default icon is a placeholder**: packaging currently relies on the default Electron/app icon until a final ExileLens KR icon is provided.
- **Windows clipboard copy request can fail depending on focus**: item capture sends a single user-triggered `Ctrl+C` copy request after hiding the overlay. Some focus states may prevent it; manual paste fallback remains available.
- **Resolved: Vite dev-server esbuild audit item**: `GHSA-g7r4-m6w7-qqqr` was remediated by keeping `vite` on the Electron-compatible 7.x line and overriding only Vite's nested `esbuild` dependency to `0.28.1` in `package.json`. Re-run `npm audit --audit-level=low` after dependency changes.
