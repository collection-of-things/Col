export const offlineMediaPreviews = new Set(["solid-ui/Avatar", "solid-ui/Progress Circle", "zaidan/Avatar", "zaidan/Message", "zaidan/Sidebar", "magicui-solid/Avatar Circles", "magicui-solid/Hero Video Dialog"]);

export async function verifySolidReview(frame, id, expect, { chipKeyboard = false } = {}) {
  if (id === "rocksolid/Tabs") {
    const list = frame.getByRole("tablist");
    const home = frame.getByRole("tab", { name: "Home" });
    const profile = frame.getByRole("tab", { name: "Profile" });
    await expect(list).toHaveAttribute("aria-orientation", "vertical");
    await home.focus();
    await home.press("ArrowRight");
    await expect(home).toBeFocused();
    await home.press("ArrowDown");
    await expect(profile).toBeFocused();
    await profile.press("ArrowUp");
    await expect(home).toBeFocused();
    await home.press("ArrowUp");
    await expect(frame.getByRole("tab", { name: "Settings" })).toBeFocused();
    await frame.getByRole("tab", { name: "Settings" }).press("ArrowDown");
    await expect(home).toBeFocused();
    await profile.click();
    await expect(profile).toHaveAttribute("aria-selected", "true");
    await expect(frame.locator('[dir="rtl"]')).toBeVisible();
  }
  if (id === "rocksolid/Accordion") {
    const trigger = frame.getByRole("button", { name: "What is gravity?" });
    const details = frame.getByText(/Gravity is a force that attracts objects/).locator("..");
    await expect(details).toHaveAttribute("inert", "");
    await expect(details).toHaveAttribute("aria-hidden", "true");
    await trigger.click();
    await expect(details).not.toHaveAttribute("inert");
    await expect(details).toHaveAttribute("aria-hidden", "false");
    await trigger.click();
    await expect(details).toHaveAttribute("inert", "");
    await expect(details).toHaveAttribute("aria-hidden", "true");
  }
  if (id === "rocksolid/Chip") {
    const label = frame.getByText("Chip 1", { exact: true });
    const remove = frame.getByRole("button", { name: "Remove Chip 1", exact: true });
    const action = process.env.SOLID_CHIP_ACTION ?? (chipKeyboard ? "Delete" : "icon");
    if (action === "click") await remove.click();
    else if (action !== "icon") await remove.press(action);
    else await label.locator("..").locator(":scope > span").last().click();
    await expect(label).toHaveCount(0);
    await expect(frame.getByText("Chip 2", { exact: true })).toBeVisible();
    if (chipKeyboard) await frame.getByRole("button", { name: "Remove Chip 2" }).click();
    else await frame.getByRole("button", { name: "Remove Chip 2" }).press("Enter");
    await expect(frame.getByText("Chip 2", { exact: true })).toHaveCount(0);
  }
  if (["solid-ui/OTP Field", "shadcn-solid/OTP Field", "zaidan/Input OTP"].includes(id)) {
    const input = frame.locator("[data-corvu-otp-field-input]");
    await input.fill("");
    await input.pressSequentially("123456");
    await expect(input).toHaveValue("123456");
    await input.selectText();
    await input.evaluate(element => new Promise(resolve => requestAnimationFrame(resolve)));
    await input.evaluate(element => {
      element.setRangeText("654-321", element.selectionStart, element.selectionEnd, "end");
      element.dispatchEvent(new InputEvent("input", { inputType: "insertFromPaste", data: "654-321", bubbles: true }));
    });
    await expect(input).toHaveValue("654321");
    const overflow = await frame.locator("html").evaluate(root => root.scrollWidth - root.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
  if (["solid-ui/Avatar", "solid-ui/Progress Circle", "zaidan/Avatar", "zaidan/Message", "zaidan/Sidebar"].includes(id)) {
    await expect(frame.locator('img[src^="https://github.com/"]')).toHaveCount(0);
    const fallback = id.startsWith("solid-ui/") ? "EK" : id === "zaidan/Message" ? "ME" : "CN";
    if (id === "zaidan/Sidebar" && !(await frame.getByText(fallback, { exact: true }).first().isVisible())) {
      await frame.getByRole("button", { name: "Toggle Sidebar" }).first().click();
    }
    await expect(frame.getByText(fallback, { exact: true }).first()).toBeVisible();
    if (id === "zaidan/Avatar") {
      await expect(frame.getByText("CN", { exact: true })).toHaveCount(2);
      await expect(frame.getByText("ER", { exact: true })).toHaveCount(2);
      await expect(frame.getByText("CR", { exact: true })).toHaveCount(1);
    }
    if (id === "zaidan/Message") {
      await expect(frame.getByText("ME", { exact: true })).toHaveCount(2);
      await expect(frame.getByText("R", { exact: true })).toHaveCount(2);
    }
    if (id === "zaidan/Sidebar") {
      await frame.getByRole("button", { name: /shadcn/i }).click();
      await expect(frame.getByText("CN", { exact: true })).toHaveCount(2);
    }
  }
  if (id === "magicui-solid/Avatar Circles") {
    const avatars = frame.locator("#col-root img");
    await expect(avatars).toHaveCount(6);
    await expect(frame.locator('#col-root a[href="#"]')).toHaveCount(6);
    for (let index = 0; index < 6; index++) {
      await expect(avatars.nth(index)).toHaveAttribute("src", /^data:image\/png;base64,/);
      expect(await avatars.nth(index).evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    }
  }
  if (id === "magicui-solid/Hero Video Dialog") {
    const play = frame.getByRole("button", { name: "Play video" });
    await expect(play).toBeVisible();
    const thumbnail = frame.locator('img[alt="Sample video thumbnail"]:visible');
    await expect(thumbnail).toHaveAttribute("src", /^data:image\/webp;base64,/);
    expect(await thumbnail.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    await play.click();
    const player = frame.locator('iframe[title="Hero Video player"]');
    await expect(player).toHaveAttribute("src", /^blob:/);
    const video = frame.frameLocator('iframe[title="Hero Video player"]').locator("video");
    await video.evaluate(async element => {
      element.muted = true;
      await Promise.race([element.play(), new Promise((_, reject) => setTimeout(() => reject(new Error("Sample video did not start")), 5000))]);
    });
    await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(0);
    await frame.locator('div[role="button"][tabindex="0"]').press("Escape");
    await expect(player).toHaveCount(0);
  }
}
