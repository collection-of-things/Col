/** Check the original card's styling and clearly labeled sample content. */
export async function verifyMagicuiTweet(frame, expect, theme) {
  await expect(frame.getByText("Sample Author", { exact: true })).toBeVisible();
  await expect(frame.getByText("@sample", { exact: true })).toBeVisible();
  await expect(frame.getByText(/Sample content: explore components/)).toBeVisible();
  const card = frame.locator("#col-root > div > div").first();
  const styles = await card.evaluate(element => {
    const bounds = element.getBoundingClientRect(), parent = element.parentElement.getBoundingClientRect();
    return { radius: getComputedStyle(element).borderRadius, maxWidth: getComputedStyle(element).maxWidth,
      dark: document.documentElement.classList.contains("dark"), centered: Math.abs((bounds.left - parent.left) - (parent.right - bounds.right)) <= 1 };
  });
  expect(styles).toEqual({ radius: "12px", maxWidth: "512px", dark: theme === "dark", centered: true });
  await expect.poll(() => frame.locator('img[alt="sample"]').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  const video = frame.locator("video").first();
  await expect(video).toBeVisible();
  await video.evaluate(async element => { element.muted = true; await element.play(); });
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(0);
  await expect(video.locator("source")).toHaveAttribute("src", /^data:video\/mp4;base64,/);
  await video.evaluate(() => new Promise(resolve => setTimeout(resolve, 1200)));
  await expect.poll(() => card.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
}
