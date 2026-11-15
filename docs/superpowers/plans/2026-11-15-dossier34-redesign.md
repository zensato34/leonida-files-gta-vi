# LEONIDA FILES — DOSSIER 34 Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing static GTA VI fan portal into a cinematic, classified-style editorial experience while preserving its official-source discipline and GitHub Pages deployment.

**Architecture:** Keep the existing single-page HTML/CSS/vanilla-JS architecture and append focused layers to the current style and script blocks. Add self-contained HTML modules for atlas, evidence, timeline and Hangar 34; client-only search, favorites and visit-delta features use localStorage with safe fallbacks. No external runtime dependencies.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Python 3 standard library for contract tests, GitHub Pages and GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-15-leonida-files-dossier34-design.md`

## Global Constraints
- Keep all existing GTA VI dossier content and source links unless a factual defect is directly exposed by the new interaction.
- Use only official Rockstar-hosted imagery already in the site; no generated or synthetic game imagery.
- Keep the independent fan-made disclaimer visible and do not imply affiliation with Rockstar/Take-Two.
- Keep auto-discovered RSS items labelled “Pendiente de verificación”.
- Do not invent a map, geography, vehicles, dates, prices, music credits, or other GTA VI facts.
- Preserve GitHub Pages static hosting and do not add dependencies, tracking or audio playback.
- Respect keyboard, touch, focus visibility, responsive layouts and `prefers-reduced-motion`.
- Preserve the lowercase author credit `zensato34`.

## Review Focus
- Browser blocks or disables localStorage: features must degrade without throwing or blocking navigation.
- News feed JSON is missing, empty, malformed, or contains malformed dates/links: static news still works and untrusted fields remain text-only.
- User has reduced motion enabled: intro and reveal/parallax animations must be skipped.
- Small screens and landscape phone screens: nav, command palette, favorites drawer and cards must not overflow.
- Keyboard-only user: overlays can open, close, and move focus without trapping navigation.

---

### Task 1: Define automated site contract tests

**Files:**
- Create: `tests/test_site_contract.py`
- Test: `tests/test_site_contract.py`

**Interfaces:**
- Consumes: `index.html`
- Produces: standard-library tests validating new section anchors, accessible controls, no external runtime dependencies, reduced-motion support and current independent/source-disclosure text.

- [ ] **Step 1: Write the failing tests** for the planned IDs `atlas`, `evidencias`, `cronologia`, `hangar`, `commandPalette`, `favoritesDrawer`, `sinceLastVisit` and nav link integrity.
- [ ] **Step 2: Run** `python -m unittest discover -s tests -v`.
  **Expected:** FAIL because the new modules and controls are not in the current page.
- [ ] **Step 3: Keep tests dependency-free**, using `html.parser`, `re` and `unittest`.
- [ ] **Step 4: Commit** test-first contract.

### Task 2: Cinematic identity, navigation and global command palette

**Files:**
- Modify: `index.html`
- Test: `tests/test_site_contract.py`

**Interfaces:**
- Consumes: existing nav IDs and static single-file layout.
- Produces: `#commandPalette`, `#commandInput`, `#openCommand`, `#bootScreen`, and CSS tokens/animations.

- [ ] **Step 1:** Extend header navigation with stable anchors for Atlas, Dossiers, Radio, Evidence, Timeline, Media and Editions; add a keyboard-search entry.
- [ ] **Step 2:** Add a brief, skippable first-visit boot screen and skip it for reduced-motion users.
- [ ] **Step 3:** Implement `Ctrl/⌘+K`, `/` search shortcut where appropriate, Escape close, live result filtering and section jump.
- [ ] **Step 4:** Add palette, command palette and keyboard accessibility checks.
- [ ] **Step 5:** Run `python -m unittest discover -s tests -v` and a JavaScript syntax check.

### Task 3: Atlas, Evidence Center, chronology and Hangar 34

**Files:**
- Modify: `index.html`
- Test: `tests/test_site_contract.py`

**Interfaces:**
- Consumes: `#mundo .place`, `#newsList .news`, `data-kind` and the RSS feed rendering.
- Produces: `#atlas`, `#evidencias`, `#cronologia`, `#hangar`, evidence counters, region filters and a generated timeline.

- [ ] **Step 1:** Build the Atlas as a thematic index of existing named regions, with a visible disclaimer that it is not an official cartographic map.
- [ ] **Step 2:** Add Evidence Center classification cards and counters derived from real news items; keep automatic feed entries pending.
- [ ] **Step 3:** Generate a chronological list from dated news entries already displayed; handle dates that cannot be parsed.
- [ ] **Step 4:** Build Hangar 34 category panels with an explicit empty/preparation state; do not invent vehicle identities or details.
- [ ] **Step 5:** Test empty, populated and malformed date states, then run the full Python test suite.

### Task 4: Personal archive, favorites and visit delta

**Files:**
- Modify: `index.html`
- Test: `tests/test_site_contract.py`

**Interfaces:**
- Consumes: stable IDs / article headings and RSS `published_at`.
- Produces: `#favoritesDrawer`, `#sinceLastVisit`, local saved items and a browser-local previous-visit timestamp.

- [ ] **Step 1:** Add save controls to supported news, character, region and radio cards. Media tiles remain direct official-source links so no interactive button is nested inside an anchor.
- [ ] **Step 2:** Persist favorites locally with guarded storage access; render a drawer with working section links and remove actions.
- [ ] **Step 3:** Compare RSS timestamps with the previous visit and display a “Novedades desde tu última visita” count without modifying editorial status.
- [ ] **Step 4:** Test behavior with blocked/empty storage and malformed timestamps; run the full test suite.

### Task 5: Motion polish, responsive and accessibility verification

**Files:**
- Modify: `index.html`
- Test: `tests/test_site_contract.py`

**Interfaces:**
- Consumes: existing CSS reveal/progress layer and new modules.
- Produces: consistent responsive states, reduced-motion overrides, active-section navigation, pointer-only subtle parallax and focus treatment.

- [ ] **Step 1:** Apply the selected palette and component tokens without removing the existing Rockstar background image or official media.
- [ ] **Step 2:** Add card depth/active navigation and low-cost scanner details; avoid canvas, WebGL and background video.
- [ ] **Step 3:** Add mobile and landscape breakpoints, visible focus states and reduced-motion fallbacks.
- [ ] **Step 4:** Run Python suite, HTML parser checks, JS syntax checks and test the published page after deployment.

### Task 6: Documentation and review package

**Files:**
- Modify: `README.md`
- Test: `tests/test_site_contract.py`

**Interfaces:**
- Consumes: implemented page features and existing workflow schedule.
- Produces: accurate README description, local preview/test commands and editorial limitation notes.

- [ ] **Step 1:** Update README to describe the new sections and local-browser features.
- [ ] **Step 2:** Confirm the daily RSS workflow and its 08:15 Dominican time note remain unchanged.
- [ ] **Step 3:** Run the full test suite and inspect the full diff.
- [ ] **Step 4:** Perform a separate code-review pass before requesting integration.

## Verification commands
- `python -m unittest discover -s tests -v`
- `python -m py_compile scripts/update_news.py`
- `python - <<'PY' ... HTMLParser validation ... PY`
- `node --check <extracted inline JavaScript>` (only if Node.js is available)
- Public smoke check: open `https://zensato34.github.io/leonida-files-gta-vi/` after integration and verify the new anchors, page metadata and image links.

## Integration
All work remains on `redesign/dossier34-cinematic` until tests and review are complete. Creating/merging a pull request into `main` and thereby publishing the redesign is a separate integration action.
