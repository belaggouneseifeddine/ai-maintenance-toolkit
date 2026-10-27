# UI Design System v1 — 2026-10-27

## Scope

This branch contains a presentation-only refinement for Maintenance AI Toolkit. It does not change diagnostic rules, Bayesian inference, AI requests, safety gates, local storage, or navigation logic.

## Design goals

- Industrial, technical visual language with a restrained teal/navy palette.
- Clear hierarchy between page title, safety notices, key actions, records, and diagnostic results.
- Touch-friendly controls with a minimum 48px height for primary form controls and buttons.
- Responsive layouts for narrow Android screens, tablets, and desktop.
- Consistent card radii, spacing, borders, focus rings, and restrained shadows.
- Better RTL/LTR resilience using logical spacing and existing language direction.
- Dark-theme parity for surfaces, controls, records, and navigation.
- Respect reduced-motion preferences and preserve visible keyboard focus.

## Changes

- Added a final design-system layer to `ux-redesign.css` to normalize spacing, typography, cards, inputs, buttons, result panels, records, dashboard actions, and navigation.
- Tightened small-screen layouts and improved form/action spacing without modifying application behavior.
- Added dark-theme adjustments using the existing `data-theme="dark"` convention.

## Acceptance checklist

### Visual and responsive
- [ ] Review at 320px, 360px, 390px, 600px, 768px, 1024px, and 1280px widths.
- [ ] Confirm no horizontal overflow in Arabic, French, and English.
- [ ] Confirm the fixed bottom navigation does not cover form actions or report content.
- [ ] Confirm dashboard cards and statistics remain legible at 320px.
- [ ] Confirm inputs, selects, textareas, checkboxes, and buttons are easy to tap.
- [ ] Review light and dark themes for readable contrast.
- [ ] Confirm keyboard focus is visible and reduced-motion preference is respected.

### Functional regression
- [ ] Home dashboard actions open the expected sections.
- [ ] Language switching preserves layout and labels.
- [ ] Diagnosis and safety-gate behavior are unchanged.
- [ ] AI form remains marked experimental and displays no fabricated live status.
- [ ] Maintenance records, filters, CSV/JSON export/import, and handover functions still work.
- [ ] Run existing UI smoke tests and repository test workflows against this branch.

## Verification status

The CSS change has been committed to the design branch. A rendered-browser visual review and post-change CI run have not yet been confirmed. Do not merge or deploy until the acceptance checklist and applicable tests have passed.
