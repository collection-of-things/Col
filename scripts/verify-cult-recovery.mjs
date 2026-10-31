import previews from "../data/component-previews/extra.json" with { type: "json" };
import bundles from "../data/component-previews/package-bundles-cult-radix.json" with { type: "json" };

export async function blockCultRadixCdn(page) {
  await page.route(url => url.hostname === "esm.sh" && /^\/(?:radix-ui(?:@|\/|$)|@radix-ui\/)/.test(url.pathname), route => route.abort());
}

const actions = {
  "cult-ui/Bg Image Texture": async (frame, expect) => {
    const texture = frame.locator('#col-root [aria-hidden="true"][style*="background-image"]').first();
    const original = await texture.evaluate(element => getComputedStyle(element).backgroundImage);
    await frame.getByRole("button", { name: "grid-noise", exact: true }).click();
    const selected = await texture.evaluate(element => getComputedStyle(element).backgroundImage);
    expect(selected).not.toBe(original);
    expect(selected).toMatch(/^url\(["']?data:image\//);
    expect(await texture.evaluate(async element => {
      const source = getComputedStyle(element).backgroundImage.match(/^url\(["']?(data:image\/.*?)["']?\)$/)?.[1];
      if (!source) return false;
      const image = new Image();
      image.src = source;
      await image.decode();
      return image.naturalWidth > 0 && image.naturalHeight > 0;
    })).toBe(true);
    const slider = frame.getByRole("slider").first();
    await slider.focus();
    await slider.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuenow", "0.51");
    await expect(frame.getByText("Opacity: 0.51", { exact: true })).toBeVisible();
    await expect(texture).toHaveCSS("opacity", "0.51");
  },
  "cult-ui/Bg Animated Fractal Grid": async (frame, expect) => {
    const dots = frame.getByRole("button", { name: "Dots", exact: true });
    await dots.click();
    await expect(dots).toHaveAttribute("aria-expanded", "true");
    await expect(frame.getByRole("slider").first()).toBeVisible();
  },
  "cult-ui/Canvas Fractal Grid": async (frame, expect) => {
    const gradients = frame.getByRole("tab", { name: "Gradients", exact: true });
    await gradients.click();
    await expect(gradients).toHaveAttribute("aria-selected", "true");
  },
  "cult-ui/Color Picker": async (frame, expect) => {
    await frame.getByRole("button", { name: /^hsl\(/ }).first().click();
    const dialog = frame.getByRole("dialog").first();
    await expect(dialog).toBeVisible();
    await dialog.press("Escape");
    await expect(dialog).toHaveCount(0);
  },
  "cult-ui/Fluted Glass": async (frame, expect) => {
    const mountains = frame.getByRole("button", { name: "Mountains", exact: true });
    await mountains.click();
    await expect(mountains).toHaveClass(/\bborder-primary\b/);
  },
  "cult-ui/Halo Field": async (frame, expect) => {
    await frame.getByRole("button", { name: "Toggle validation (demo)", exact: true }).click();
    await expect(frame.getByLabel("Email", { exact: true })).toHaveAttribute("aria-invalid", "true");
    await expect(frame.getByText("Enter a valid email address.", { exact: true })).toBeVisible();
  },
  "cult-ui/Mock Browser Window": async (frame, expect) => {
    const toggle = frame.getByRole("switch").first();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
  },
  "cult-ui/Shader Lens Blur": async (frame, expect) => {
    const toggle = frame.getByRole("switch").first();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
  },
  "cult-ui/Toolbar Expandable": async (frame, expect) => {
    await frame.getByRole("button", { name: "Expand", exact: true }).click();
    await expect(frame.getByRole("button", { name: "Collapse", exact: true })).toBeVisible();
  },
  "cult-ui/Wizard Expandable": async (frame, expect) => {
    await frame.getByRole("tab", { name: /Account/ }).click();
    const name = frame.getByLabel("Full name", { exact: true });
    await name.fill("Jordan");
    await expect(name).toHaveValue("Jordan");
  },
};

/** Check the original styles, media and one meaningful interaction per demo. */
export async function verifyCultRecovery(frame, id, expect, theme) {
  if (!bundles["radix-ui@1.4.3"].components.includes(id)) return false;
  const action = actions[id];
  if (!action) throw new Error(`No interaction check for ${id}`);
  const html = frame.locator("html");
  await expect(html).toHaveCSS("color-scheme", theme);
  expect(await html.evaluate(element => element.classList.contains("dark"))).toBe(theme === "dark");
  const css = previews.styles[previews.entries[id].styleKey];
  expect(await frame.locator("style").evaluateAll((styles, original) => styles.some(style => style.textContent.includes(original)), css)).toBe(true);
  const brokenImages = await frame.locator("#col-root img").evaluateAll(async images => {
    await Promise.all(images.map(image => image.decode().catch(() => {})));
    return images.filter(image => !image.complete || !image.naturalWidth).map(image => image.currentSrc || image.src);
  });
  expect(brokenImages).toEqual([]);
  if (["cult-ui/Bg Animated Fractal Grid", "cult-ui/Canvas Fractal Grid", "cult-ui/Fluted Glass", "cult-ui/Shader Lens Blur"].includes(id)) {
    const canvas = frame.locator("canvas").first();
    await expect(canvas).toBeVisible();
    expect(await canvas.evaluate(element => element.width > 0 && element.height > 0)).toBe(true);
  }
  await action(frame, expect);
  return true;
}
