export async function verifyTorchVideo(frame, expect) {
  const video = frame.locator("video").first();
  await expect(video).toBeVisible();
  const container = video.locator("..");
  await expect(container).toHaveClass(/\brounded-xl\b/);
  await expect(container).toHaveCSS("aspect-ratio", "16 / 9");
  await expect(container).toHaveCSS("border-radius", "12px");
  await expect(video).toHaveCSS("object-fit", "cover");
  expect(await video.evaluate(element => element.controls)).toBe(true);
  const poster = await video.getAttribute("poster");
  expect(poster).toMatch(/^data:image\/webp;base64,/);
  const size = await video.evaluate(async element => {
    const image = new Image();
    image.src = element.poster;
    await image.decode();
    return [image.naturalWidth, image.naturalHeight];
  });
  expect(size).toEqual([640, 268]);
  await video.evaluate(async element => { element.muted = true; await element.play(); });
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(0);
}
