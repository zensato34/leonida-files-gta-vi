# LEONIDA FILES Experience Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add a verified support hub, official update register, technical lab, local player profile, edition comparator and a cinematic visual refresh.

**Architecture:** Extend the existing static HTML/CSS/JavaScript site. Add one focused JS/CSS bundle and one JSON update register; keep all personal settings in localStorage and render catalog text with safe DOM APIs.

**Tech Stack:** HTML, CSS, vanilla JavaScript, JSON, Python unittest, Node syntax checks, GitHub Pages/PWA.

**Spec:** `docs/superpowers/specs/2026-11-18-experience-center-design.md`

## Global Constraints

- Keep the existing no-framework architecture and GitHub Pages deployment.
- No account, backend, analytics, paid API or new third-party runtime dependency.
- External factual content must remain attributed; only official patch notes may enter the patch register.
- No invented benchmarks, download sizes, patch versions, or platform features.
- Keep zensato34 lowercase and preserve the fan-project disclaimer.
- All profile data stays in localStorage; no network transmission.
- Respect prefers-reduced-motion and provide a user-selectable reduced-motion control.
- External links must be HTTPS and opened with rel="noopener noreferrer" when using a new tab.

## Review Focus

- Malformed / unsupported profile values must fall back to safe defaults and never break page startup.
- localStorage being blocked or unavailable must leave the page usable without falsely claiming the profile was saved.
- Malformed update JSON, non-official domains, or entries without source URLs must be rejected and produce a clear empty/error state.
- An empty update catalogue must not imply that the game has never been patched; the UI must say the archive has no official notes registered yet.
- Mobile navigation, narrow viewports and prefers-reduced-motion must not hide key content or trap controls.

---

### Task 1: Structural modules and editorial data contracts

**Files:**
- Modify: `index.html`
- Create: `data/updates.json`
- Test: `tests/test_experience_center.py`

**Interfaces:**
- Produces sections with IDs `soporte`, `actualizaciones`, `laboratorio`, `perfil`, `comparador`.
- Exposes the profile control IDs defined in the test.
- Update records use `version`, `published_at`, `platforms`, `title`, `summary`, `source_url`, `source_label`, `status`; status must be `official`.

- [ ] Add the failing structural tests first (already staged in `tests/test_experience_center.py`).
- [ ] Implement the five semantic sections, navigation links, accessible labels and external official source links.
- [ ] Keep the updates registry empty and record its official-only publication policy.
- [ ] Run the focused test and confirm the new assertions pass.

### Task 2: Functional experience modules

**Files:**
- Modify: `assets/js/experience34.js`
- Test: `tests/test_experience_center.py`

**Interfaces:**
- Profile key: `lf34:player-profile:v1`.
- Profile allowlists: platform `ps5|ps5pro|xbox-series-x|xbox-series-s|unknown`; region `es-ES|es-MX|us|rd|other`; edition `standard|ultimate|unknown`; theme `sunset|night`.
- Public profile API remains local to the page; no server calls.
- Support search filters only cards already present in the document.
- Update renderer accepts only well-formed entries whose source URL is HTTPS and belongs to Rockstar, PlayStation or Xbox official domains.
- Comparator updates `#editionCompareOutput` based on the selected radio input and never recommends repurchase.

- [ ] Test profile sanitization, safe update record rejection and comparator state contracts.
- [ ] Run focused tests to confirm they fail before implementation.
- [ ] Implement guarded localStorage read/write/reset and apply theme/motion/spoiler preferences.
- [ ] Implement support search and safe update rendering with textContent.
- [ ] Implement the Standard / Ultimate comparison with a dated price note.
- [ ] Run focused tests and the full Python suite.

### Task 3: Visual system and PWA integration

**Files:**
- Create: `assets/css/experience34.css`
- Modify: `index.html`
- Modify: `service-worker.js`
- Test: `tests/test_experience_center.py`, `tests/test_pwa_contract.py`

**Interfaces:**
- CSS themes use `html[data-theme="sunset"]` and `html[data-theme="night"]`.
- User-selected reduced motion uses `html[data-motion="reduced"]`.
- PWA cache identifiers advance to `static-v5` and `data-v5`.
- Precache includes the new CSS, JS and update JSON.

- [ ] Test theme tokens, reduced-motion rules and PWA cache references.
- [ ] Implement responsive cinematic visual layer, display typography, official image-led feature cards and restrained motion.
- [ ] Add Google Fonts as progressive enhancement with system fallback; the site remains readable offline.
- [ ] Update PWA cache revision and precache the new local assets.
- [ ] Run PWA and full tests.

### Task 4: Documentation and release verification

**Files:**
- Modify: `README.md`
- Create: `docs/research/2026-11-18-experience-center-sources.md`
- Modify if required: `tests/test_experience_center.py`

- [ ] Document modules, privacy, factual limits and how to add an official update record.
- [ ] Validate all JSON, run `python scripts/validate_catalog.py`, run `python -m unittest discover -s tests -v`.
- [ ] Run `node --check` on every modified/new JavaScript file and the service worker.
- [ ] Inspect PR diff and CI results; correct critical/important findings before publication.
