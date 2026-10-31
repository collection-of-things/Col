const replacements = {
  "DatePicker.tsx": [
    ["const t = d.getTime()", "const t = toISODate(d)"],
    ["t < minDate()!.getTime()", "t < toISODate(minDate()!)"],
    ["t > maxDate()!.getTime()", "t > toISODate(maxDate()!)"],
    ["new Date(effectiveViewYear(), effectiveViewMonth(), 0).getTime() >= mn.getTime()", "toISODate(new Date(effectiveViewYear(), effectiveViewMonth(), 0)) >= toISODate(mn)"],
    ["new Date(effectiveViewYear(), effectiveViewMonth() + 1, 1).getTime() <= mx.getTime()", "toISODate(new Date(effectiveViewYear(), effectiveViewMonth() + 1, 1)) <= toISODate(mx)"],
    ["new Date(y, m + 1, 0).getTime() < mn.getTime()", "toISODate(new Date(y, m + 1, 0)) < toISODate(mn)"],
    ["new Date(y, m, 1).getTime() > mx.getTime()", "toISODate(new Date(y, m, 1)) > toISODate(mx)"],
  ],
  "DateRangePicker.tsx": [
    ["props.min && d < props.min", "props.min && toISODate(d) < toISODate(props.min)"],
    ["props.max && d > props.max", "props.max && toISODate(d) > toISODate(props.max)"],
    ["props.selectableFrom && d < props.selectableFrom", "props.selectableFrom && toISODate(d) < toISODate(props.selectableFrom)"],
    ["s && d < s", "s && toISODate(d) < toISODate(s)"],
    ["new Date(viewYear, m + 1, 0).getTime() < mn.getTime()", "toISODate(new Date(viewYear, m + 1, 0)) < toISODate(mn)"],
    ["new Date(viewYear, m, 1).getTime() > mx.getTime()", "toISODate(new Date(viewYear, m, 1)) > toISODate(mx)"],
  ],
  "Chart.tsx": [
    ["let skipNextUpdate = false", "let skipNextUpdate = false\n\tlet disposed = false\n\tlet subscribed = false"],
    ["const mod = await import('chart.js/auto')", "const mod = await import('chart.js/auto')\n\t\t\tif (disposed) return"],
    ["sharedDark.subscribe()", "sharedDark.subscribe()\n\t\t\tsubscribed = true"],
    ["sharedDark.unsubscribe()", "disposed = true\n\t\tif (subscribed) sharedDark.unsubscribe()"],
  ],
  "Sparkline.tsx": [
    ["let skipNextUpdate = false", "let skipNextUpdate = false\n\tlet disposed = false"],
    ["const { Chart } = await import('chart.js/auto')", "const { Chart } = await import('chart.js/auto')\n\t\t\tif (disposed) return"],
    ["onCleanup(() => {", "onCleanup(() => {\n\t\tdisposed = true"],
  ],
};

/** Patch only the authenticated TorchUI preview copy; retain the upstream snapshot. */
export function patchTorchPreview(name, source) {
  for (const [original, replacement] of replacements[name] ?? []) {
    if (source.split(original).length !== 2) throw new Error(`TorchUI ${name} preview source changed`);
    source = source.replace(original, replacement);
  }
  return source;
}
