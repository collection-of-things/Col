import { solidPreviews } from "../data/component-previews/solid/index.ts";

export async function verifyTorchTableView(frame, expect, theme) {
  const table = frame.getByRole("table");
  await expect(table).toBeVisible();
  const rows = table.getByRole("row");
  await expect(rows).toHaveCount(4);
  const expected = [
    ["Name", "Role", "Status"],
    ["Caelan Torchward", "Fighter", "Ready"],
    ["Lyra Swiftfoot", "Rogue", "Ready"],
    ["Grimshaw Stone", "Cleric", "Resting"],
  ];
  for (const [index, cells] of expected.entries()) {
    await expect(rows.nth(index).getByRole(index === 0 ? "columnheader" : "cell")).toHaveText(cells);
  }
  expect(await frame.locator("html").evaluate(element => element.classList.contains("dark"))).toBe(theme === "dark");
  const css = solidPreviews["torch-ui/Data Table"].css;
  expect(await frame.locator("style").evaluateAll((styles, original) => styles.some(style => style.textContent.includes(original)), css)).toBe(true);
}
