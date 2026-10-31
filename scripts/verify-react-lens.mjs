/** Exercise the original lens image, magnifier and keyboard dismissal. */
export async function verifyReactLens(frame, expect) {
  const lens = frame.getByRole("region", { name: "Zoom Area" });
  await expect(lens).toBeVisible();
  await expect(frame.getByText("Your next camp", { exact: true })).toBeVisible();
  const image = lens.getByRole("img", { name: "image placeholder" }).first();
  await expect(image).toBeVisible();
  expect(await image.evaluate(element => element.complete && element.naturalWidth > 0 && element.src.startsWith("data:image/"))).toBe(true);
  expect(await lens.evaluate(element => getComputedStyle(element).borderRadius)).toBe("14px");
  const magnified = () => lens.locator("div").evaluateAll(elements => elements.some(element => getComputedStyle(element).maskImage.includes("radial-gradient")));
  await lens.hover();
  await expect.poll(magnified).toBe(true);
  await frame.getByText("Your next camp", { exact: true }).hover();
  await expect.poll(magnified).toBe(false);
  await lens.focus();
  await lens.dispatchEvent("mouseover", { bubbles: true });
  await expect.poll(magnified).toBe(true);
  await lens.press("Escape");
  await expect.poll(magnified).toBe(false);
}
