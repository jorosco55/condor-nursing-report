---
name: condor-formly-cleanup
description: Refactor the Condor/Vighter Angular Ionic app forms toward DRY Formly-backed generic field patterns. Use when editing condor-app form pages, reducing repeated Taiga/Ionic text/select/textarea markup, adding common field components, or deciding whether a field should stay bespoke under DRY and YAGNI constraints.
---

# Condor Formly Cleanup

## Overview

Use Formly to remove repeated form-field markup while preserving Condor's current reactive-form data shape, tab workflow, touch behavior, and localStorage report persistence. Prefer small, behavior-preserving conversions over broad rewrites.

## Workflow

1. Inspect the page's existing `FormGroup`/`FormArray`, template bindings, page-specific styles, and save/load logic before editing.
2. Identify repeated primitive fields first: text, date, time, select, textarea, and simple numeric inputs.
3. Keep bespoke controls out of Formly unless repetition proves otherwise: signature canvases, dynamic event rows with buttons, chip-style yes/no groups, narrative command behavior, and one-off clinical sections.
4. Add or reuse a common Formly type instead of embedding Taiga/Ionic markup in page templates.
5. Convert one page or one section at a time, then run `npm run build` and `npm run lint`.

## Field Patterns

- Register shared Formly field types in `src/main.ts` with `provideFormlyCore`.
- Place generic Formly field components under `src/app/shared/formly/`.
- Keep field config close to the page that owns the business workflow unless the config is truly reused across pages.
- Use `props` for labels, placeholders, options, input mode, max length, CSS classes, and simple DOM attributes.
- Use validators in the existing reactive form setup when the page already owns validation. Do not introduce a second validation model without need.

## DRY And YAGNI Rules

- DRY: create an abstraction when at least three fields share the same structure or when a page has clear repeated row metadata.
- YAGNI: do not build a schema engine for every control type up front. Add field types only when converting real fields.
- Preserve model keys exactly. PDF export, records, and localStorage depend on `NursingReport` shape.
- Preserve touch affordances: 44px targets, signature scroll prevention, native date/time behavior, and existing `inputmode`/`maxlength` constraints.
- Avoid mixing UI libraries for new field types. Prefer Taiga components already used by the app.

## Verification

- Run `npm run build`. If it fails only because Google Fonts cannot be fetched, rerun with network approval.
- Run `npm run lint`.
- For touched pages, manually scan that `formControlName` keys, save payloads, and loaded draft data still line up.
