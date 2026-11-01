// Adapt known upstream defects in compiled previews without changing the pinned source snapshots.
const replacements = {
  "packages/components/src/alert/alert-icon.tsx": [[
    'return props["aria-hidden"] ?? "true";',
    'return "aria-hidden" in props ? props["aria-hidden"] : "true";',
  ]],
  "packages/i18n/src/direction.ts": [[
    `  if (Intl.Locale) {
    const script = new Intl.Locale(locale).maximize().script ?? "";
    return RTL_SCRIPTS.has(script);
  }

  const lang = locale.split("-")[0] ?? "";`,
    `  if (Intl.Locale) {
    try {
      const script = new Intl.Locale(locale).maximize().script ?? "";
      return RTL_SCRIPTS.has(script);
    } catch {
      // Fall back to the primary language for malformed locale tags.
    }
  }

  const lang = (locale.split(/[-_]/)[0] ?? "").toLowerCase();`,
  ]],
  "packages/primitives/src/calendar/calendar-root.ts": [[
    '  type CalendarDate,\n  getLocalTimeZone,',
    '  type CalendarDate,\n  endOfMonth,\n  getLocalTimeZone,',
  ], [
    `    return {
      start: lastAvailableDateFrom(anchor, -1, isDateUnavailable),
      end: lastAvailableDateFrom(anchor, 1, isDateUnavailable),
    };`,
    `    // Paging must search beyond the original one-month window before offering an endpoint.
    const visible = visibleMonth();
    const backSpan = Math.max(31, anchor.compare(startOfMonth(visible)));
    const forwardSpan = Math.max(31, endOfMonth(visible).compare(anchor));
    return {
      start: lastAvailableDateFrom(anchor, -1, isDateUnavailable, { days: backSpan }),
      end: lastAvailableDateFrom(anchor, 1, isDateUnavailable, { days: forwardSpan }),
    };`,
  ], [
    `    const isAnchoredRun = availableRange() !== null;
    const target = isAnchoredRun ? constrainDate(date, min(), max()) : date;`,
    `    const isAnchoredRun = availableRange() !== null;
    let target = isAnchoredRun ? constrainDate(date, min(), max()) : date;
    const anchor = anchorDate();
    const isDateUnavailable = isDateDisabledFn();
    if (isAnchoredRun && anchor !== null && isDateUnavailable !== undefined) {
      // A programmatic endpoint may be beyond the visible month's cached search window.
      const distance = target.compare(anchor);
      const direction = distance < 0 ? -1 : 1;
      const edge = lastAvailableDateFrom(anchor, direction, isDateUnavailable, { days: Math.abs(distance) });
      if (edge !== undefined) {
        target = constrainDate(target, direction < 0 ? edge : undefined, direction > 0 ? edge : undefined);
      }
    }`,
  ]],
  "packages/primitives/src/calendar/calendar-next.ts": [[
    "() => state.next()",
    "() => { state.next(); if (state.anchorDate() !== null) state.setPendingCursorFocus(true); }",
  ]],
  "packages/primitives/src/calendar/calendar-prev.ts": [[
    "() => state.prev()",
    "() => { state.prev(); if (state.anchorDate() !== null) state.setPendingCursorFocus(true); }",
  ]],
  "packages/primitives/src/combobox/combobox-input.ts": [[
    '    .on("Escape", (event) => {\n      if (!state.open()) {',
    '    .on("Escape", (event) => {\n      if (!state.open() || !state.closeOnEscape()) {',
  ]],
  "packages/primitives/src/combobox/combobox-trigger.ts": [[
    '    .on("Escape", (event) => {\n      if (!state.open()) {',
    '    .on("Escape", (event) => {\n      if (!state.open() || !state.closeOnEscape()) {',
  ]],
};

export const hopePreviewFiles = Object.keys(replacements);

export function patchHopePreview(path, source) {
  for (const [before, after] of replacements[path] ?? []) {
    if (source.split(before).length !== 2) throw new Error(`Hope UI preview input changed: ${path}`);
    source = source.replace(before, after);
  }
  return source;
}
