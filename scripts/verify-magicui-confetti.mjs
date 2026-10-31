export async function verifyMagicuiConfetti(frame, expect) {
  const canvas = frame.locator("#col-root canvas").first();
  await expect(canvas).toBeVisible();
  const hasPixels = () => canvas.evaluate(element => {
    const context = element.getContext("2d");
    if (!context || !element.width || !element.height) return false;
    const pixels = context.getImageData(0, 0, element.width, element.height).data;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i]) return true;
    return false;
  });
  await canvas.page().mouse.move(0, 0);
  await expect.poll(hasPixels, { timeout: 8000 }).toBe(true);
  await expect.poll(hasPixels, { timeout: 12000 }).toBe(false);
  await canvas.hover({ position: { x: 10, y: 10 } });
  await expect.poll(hasPixels, { timeout: 8000 }).toBe(true);
}
