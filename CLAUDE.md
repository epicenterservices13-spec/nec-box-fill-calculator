# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page React 19 + TypeScript + Vite 8 web app that computes electrical box fill per **NEC Article 314.16**. No backend, no router, no persistence beyond `localStorage`. Deployed to GitHub Pages.

## Commands

```bash
npm install --legacy-peer-deps   # required — plain `npm install` hits peer-dep conflicts
npm run dev                      # Vite dev server on :5173
npm run build                    # tsc --noEmit typecheck, then vite build, then GH Pages fixups
npm run preview                  # serve dist/
npm run deploy                   # build + gh-pages -d dist
```

`build` invokes `node node_modules/typescript/bin/tsc` and `node node_modules/vite/bin/vite.js` directly (bin shims are not relied on), then copies `dist/index.html` to `dist/404.html` and touches `dist/.nojekyll` for SPA routing on Pages.

Adding a field to `BoxFillInputs` means teaching `normalizeInputs()` in `App.tsx` about it — saved state and share links predate every new field, so gaps are filled from `DEFAULT_INPUTS` while arrays default to empty (never to the demo data, which would silently double-count).

There is **no test suite and no test runner** — there is nothing to run for a single test. Verification is `npm run build` (which typechecks) plus exercising the UI in `npm run dev`.

## Known config landmines

Confirm any of these before "fixing" them; they are traps, not bugs to clean up casually.

- **`npm run lint` does not exist.** `eslint.config.js` (flat config) imports `typescript-eslint`, which is **not in `package.json`** — running ESLint fails on import until that package is added. A legacy `.eslintrc.cjs` also sits alongside the flat config; ESLint 10 ignores it.
- **Prettier config contradicts the source.** `.prettierrc` sets `semi: false`, but every file in `src/` is written with semicolons, and both ESLint configs set `prettier/prettier: 'error'`. Enabling lint/format as-is would rewrite the whole codebase. Match the surrounding file's existing style (semicolons, single quotes) rather than the `.prettierrc`.
- **`tailwind.config.ts` is effectively dead.** Tailwind v4 is wired CSS-first via `@import "tailwindcss"` in `src/index.css` plus the `@tailwindcss/vite` plugin; the v3-style config file is never loaded (no `@config` directive), so its `primary` palette does not exist. Components use stock `zinc-*` / `indigo-*` utilities.
- **`framer-motion` is a declared dependency but is not imported anywhere.**
- `vite.config.ts` pins `base: '/nec-box-fill-calculator/'`. Changing the repo name breaks asset paths.

## Architecture

One-way data flow with a single state object and a single pure calculation function:

```
App.tsx  ──  inputs: BoxFillInputs (one useState, persisted to localStorage key `nec_box_fill_inputs_v2`)
   │            └─ mutated only through updateInputs(partial)
   │            └─ seeded from #s= share link > localStorage > DEFAULT_INPUTS, via normalizeInputs()
   │
   ├─ useMemo → calculateBoxFill(inputs) → CalculationResult
   │
   ├─ savedJobs: SavedJob[] (localStorage key `nec_box_fill_jobs_v1`, one entry per box on the job)
   │
   ├─ left column:  BoxSelector / CableForm / ConductorForm / DeviceForm / HardwareForm   (write inputs)
   └─ right column: VisualBox / ResultsBreakdown, plus 4 modals                           (read result)
```

- **`src/types/nec.ts`** is the contract for everything. `BoxFillInputs` in, `CalculationResult` out; `VolumeBreakdownItem` is the row format that drives every display surface.
- **`src/utils/calculator.ts`** is the only place NEC math lives. It is a pure function with five numbered sections matching the code subsections: (B)(1) conductors → (B)(2) clamps → (B)(3) support fittings → (B)(4) device yokes → (B)(5) EGCs. Each section pushes a `VolumeBreakdownItem` carrying its own `necRef` string.
- **`src/data/necTables.ts`** holds all NEC lookup data: `NEC_CONDUCTOR_VOLUMES` (Table 314.16(B)), `STANDARD_BOXES` (Table 314.16(A)), `EXTENSION_RINGS`, `WIRING_PRESETS`, and `WIRE_SIZE_ORDER` / `getLargerWireSize()`. Wire sizes are compared by **index into `WIRE_SIZE_ORDER`**, never numerically — `'4/0'` is a string, and higher index means larger conductor.
- **`src/utils/shareLink.ts`** encodes `BoxFillInputs` as base64url in the URL hash (`#s=`). `App.tsx` reads it **once at module load** (`SHARED_INPUTS`) because the state initializer clears the hash — anything needing to know a link was opened must capture it before that.
- **`src/utils/savedJobs.ts`** is the `SavedJob[]` localStorage layer behind `SavedJobsModal`; `InspectionReportModal` re-runs `calculateBoxFill` over those saved inputs to print a whole-project roster.
- **`src/data/codeReferences.ts`** is display-only text (`NEC_CODE_ARTICLES`, `INSPECTION_CHECKLIST`) for `CodeReferenceModal`.

Because `ResultsBreakdown` and `InspectionReportModal` both render `result.breakdown` generically, **a new fill rule only needs: a field in `BoxFillInputs`, a section in `calculateBoxFill` that pushes a breakdown item, and an input control in the relevant form component.** The display surfaces pick it up for free.

### Calculation conventions

- Everything is computed in **cubic inches**; cm³ is a derived display value (`cuIn * 16.3871`, rounded). The `unit: 'imperial' | 'metric'` prop is threaded down from `App` and only affects formatting — each consumer has its own local `formatVol()` helper.
- `largestConductorInBox` is accumulated across conductors, EGCs, and devices *before* the clamp/support/device sections use it as a fallback. Order matters in that function.
- **Cables are sugar, not a fill rule.** `expandCables()` turns each `CableEntry` into one synthetic `ConductorEntry` plus its EGCs *before* section (B)(1) runs, so the five numbered sections never know cables exist. Cable grounds are **added to** `inputs.egcCount` (which now means "grounds not already in a cable"), and `result.totalEgcCount` / `egcCountFromCables` are what the UI displays. `CABLE_TYPES` only lists sizes whose EGC matches the circuit conductors.
- `findBoxSuggestions()` scans `STANDARD_BOXES` × `EXTENSION_RINGS` for the smallest assemblies that hold the required volume, preferring ≤85% fill and gated by `isRingCompatible()` (rings land on 4" and 4-11/16" square boxes only). It runs only when the box fails or exceeds 85%.
- Pigtails (`isPigtail: true`) contribute zero volume and are excluded from the largest-conductor scan, per 314.16(B)(1).
- EGCs: 1–4 grounds = 1 allowance; each ground beyond 4 adds 0.25; an isolated ground adds 1 more.
- Devices: `gangs * 2` allowances, sized by `wireSizeConnected`.

### UI conventions

- Dark theme only: `zinc-950` surfaces, `indigo-500/600` accents, `rounded-xl`/`rounded-3xl`, `border-zinc-800`. A `.glass` utility class is defined in `src/index.css`.
- Modals are plain conditionally-rendered fixed overlays (`if (!isOpen) return null`) — no portal, no animation library, no focus trap.
- All icons come from `lucide-react`.
- `InspectionReportModal` prints via `window.print()` and relies on `print:` Tailwind variants for the certificate layout.

## Reference

`repo-build-checklist.json` (400-item generic repo-maturity checklist) is an unused reference document, not project config.
