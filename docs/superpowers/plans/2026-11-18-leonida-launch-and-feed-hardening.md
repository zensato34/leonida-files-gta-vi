# LEONIDA FILES — Launch readiness and editorial feed hardening

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize the editorial feed, make regional launch status accurate for the owner's Spain PSN account, and refine LEONIDA FILES without losing existing content or private local data.

**Architecture:** Preserve the static GitHub Pages architecture and existing JSON catalogs. Harden RSS merging and validation in Python; make browser rendering honor editorial kind/status; use a region-aware, post-unlock countdown; apply a focused visual/navigation layer in existing CSS/HTML without external runtime dependencies.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Python 3.12 standard library, GitHub Pages, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-15-leonida-files-dossier34-design.md`

## Global Constraints
- Keep work isolated on `redesign/leonida-next-2026-11-18`; do not write to `main`.
- Preserve current editorial entries, source links, catalog records, and local player data.
- The RSS collector must never overwrite an editorially reviewed entry with an automatic RSS version.
- Google News RSS results remain `Pendiente de verificación`; RSS discovery never confirms facts.
- Normalize URLs for deduplication and preserve valid history; do not truncate the combined editorial feed.
- Confirmed news requires primary Rockstar / Rockstar Support evidence in the curated catalog.
- PSN Spain launch timing is derived from Rockstar's published local-midnight rule: 00:00 CET on 19 Nov 2026 = 19:00 America/Santo_Domingo on 18 Nov 2026. State the region and source.
- No AI-generated game imagery, no invented coordinates, game facts, unlock times, trophies, or gameplay observations.
- Preserve lowercase `zensato34`, fan-made disclaimer, responsive behavior, reduced-motion support, local-only personal data, and spoiler defaults.
- Do not add dependencies, remote runtime libraries, trackers, or audio playback.

## Review Focus
- Two URLs differing only by tracking query parameters must deduplicate without losing the reviewed record.
- A manual `reported/Reportado` entry sharing a URL with RSS must remain editorially reviewed.
- Existing feeds longer than 60 items must not be truncated by a daily RSS run.
- Malformed or missing feed fields must not create executable HTML or unsafe links.
- The countdown must show the correct Spain PSN target before unlock, recognize earlier regional releases, and transition after unlock.
- Mobile navigation and cards must not overflow at 320–390 px widths; reduced-motion users must not receive unnecessary animations.

---

### Task 1: Lock feed safety requirements with regression tests

**Files:**
- Modify: `tests/test_news_feed_updater.py`
- Modify: `tests/test_editorial_catalog.py`
- Modify: `tests/test_site_contract.py`

**Interfaces:**
- Consumes: current `update_news.main`, `validate_catalogs`, and `loadAutoNewsFeed`.
- Produces: executable tests for merge preservation, URL normalization, feed validation, complete rendering, and regional unlock behavior.

- [ ] Add a test proving an editorial `reported/Reportado` record survives an RSS duplicate with the same normalized URL.
- [ ] Add a test proving more than 60 existing entries remain after a run.
- [ ] Add a test proving query-order / tracking-parameter URL variants deduplicate.
- [ ] Add validator tests proving allowed kind/status combinations are accepted and Google News RSS cannot be marked confirmed.
- [ ] Add site contract tests for all feed entries rendering with their kind/status, and for Spain PSN target / release-state logic.
- [ ] Run the focused tests and record the expected failures before implementation.

### Task 2: Harden feed merging and validator rules

**Files:**
- Modify: `scripts/update_news.py`
- Modify: `scripts/validate_catalog.py`

**Interfaces:**
- Produces `normalize_url(url: str) -> str`.
- `update_news.main` merges by normalized URL and ID, retains prior valid records, never overwrites existing editorial entries, and never truncates combined history.
- The validator accepts `confirmed/Confirmado`, `reported/Reportado`, `reported/Pendiente de verificación`, and `rumor/Pendiente de verificación`; automatic Google News RSS entries must remain pending.

- [ ] Implement URL normalization (scheme/host normalization, sorted query parameters, removal of common tracking parameters and fragment).
- [ ] Preserve the first existing record for each normalized URL or ID; append only genuinely new RSS discoveries.
- [ ] Keep a cap only on the number of newly discovered results per run, not on the combined archive.
- [ ] Validate required fields, HTTPS URLs, ISO timestamps, date, kind, status, and RSS pending status.
- [ ] Run the feed and catalog tests, then the full test suite.

### Task 3: Render editorial feed faithfully

**Files:**
- Modify: `assets/js/dossier34.js`
- Modify: `tests/test_site_contract.py`

**Interfaces:**
- `loadAutoNewsFeed()` renders every valid feed item, maps `kind` to the matching filter, displays the stored status, and uses text-only DOM APIs.
- Unknown kinds default to a report with pending status; external links must remain HTTPS.

- [ ] Remove the hard-coded 30-entry display limit.
- [ ] Map `confirmed`, `reported`, and `rumor` to the current filter vocabulary.
- [ ] Render the actual `status` value and keep the automatic-discovery marker separate.
- [ ] Verify global search, evidence counts, timeline, and filters update after feed loading.
- [ ] Run JavaScript syntax check and full test suite.

### Task 4: Make launch status regional and time-aware

**Files:**
- Modify: `index.html`
- Modify: `assets/js/dossier34.js`
- Modify: `tests/test_site_contract.py`

**Interfaces:**
- The countdown target is the Spain PSN store region: `2026-11-18T23:00:00Z` (00:00 CET on 19 Nov, which is 19:00 RD on 18 Nov).
- The first-region threshold is `2026-11-18T11:00:00Z` (00:00 on 19 Nov in New Zealand, UTC+13).
- Before the target, the UI explains that some regions may already have access; after the target, it marks the Spain launch window as reached instead of leaving a frozen zero timer.

- [ ] Update the visible countdown copy to identify PSN Spain and its RD conversion.
- [ ] Use absolute timestamps instead of the visitor's device-local midnight.
- [ ] Add pre-unlock, early-regions-live, and Spain-unlocked states.
- [ ] Replace the stale pre-launch guide note with a post-launch verification note, without inventing in-game walkthroughs.
- [ ] Run the countdown contract tests and full suite.

### Task 5: Refine Dossier 34 presentation

**Files:**
- Modify: `index.html`
- Modify: `assets/css/dossier34.css`
- Modify: `tests/test_site_contract.py`

**Interfaces:**
- Preserve all existing section IDs and content catalogs.
- Improve the first-screen hierarchy, compact status strip, section navigation and card readability while retaining the established Vice City / classified-archive visual language.

- [ ] Add concise primary navigation group labels / quick-access structure without removing existing section anchors.
- [ ] Add clear information-status styling for confirmed, reported, pending and rumor records.
- [ ] Improve spacing, typography, contrast, mobile touch targets, focus visibility and reduced-motion fallback using existing CSS.
- [ ] Do not add generated images or third-party runtime dependencies.
- [ ] Run HTML contract tests, JavaScript syntax checks, and the full test suite.

### Task 6: Documentation and workflow verification

**Files:**
- Modify: `README.md`
- Test: all existing tests and validators.

- [ ] Document the regional Spain PSN countdown, editorial feed safety rules, and launch-phase content policy.
- [ ] Run `python -m unittest discover -s tests -v`.
- [ ] Run `python scripts/validate_catalog.py`.
- [ ] Run `node --check assets/js/dossier34.js`, `node --check assets/js/guide34.js`, `node --check assets/js/progress34.js`, `node --check assets/js/pwa34.js`, and `node --check service-worker.js`.
- [ ] Inspect the resulting commit range and latest GitHub Actions run; do not merge to `main` or claim deployment from the feature branch.
