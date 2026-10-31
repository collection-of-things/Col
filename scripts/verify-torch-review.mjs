export async function verifyTorchReview(frame, id, expect) {
  const button = name => frame.getByRole("button", { name, exact: true });
  if (id === "torch-ui/Inline") {
    await expect(frame.getByText("Left", { exact: true })).toBeVisible();
    await expect(frame.getByText("Right", { exact: true })).toBeVisible();
  } else if (id === "torch-ui/Empty State") {
    await expect(frame.getByText("No quests available", { exact: true })).toBeVisible();
    await expect(frame.getByText("Check the tavern board after the next guild post.")).toBeVisible();
  } else if (id === "torch-ui/Dropdown Menu") {
    const trigger = button("Actions");
    await expect(frame.locator("button button")).toHaveCount(0);
    await expect(trigger).toHaveCSS("border-radius", "8px");
    await trigger.focus();
    await trigger.press("Enter");
    await expect(frame.getByRole("menuitem", { name: "Inspect" })).toBeVisible();
    await frame.getByRole("menuitem", { name: "Inspect" }).press("Escape");
    await expect(frame.getByRole("menuitem", { name: "Inspect" })).toHaveCount(0);
    await trigger.click();
    await expect(frame.getByRole("menuitem", { name: "Copy Scroll" })).toBeVisible();
  } else if (id === "torch-ui/Mega Menu") {
    const wares = frame.getByRole("menuitem", { name: "Wares" });
    await wares.click();
    if (await wares.getAttribute("aria-expanded") !== "true") await wares.click();
    await expect(wares).toHaveAttribute("aria-expanded", "true");
    for (const label of ["Marketplace", "Trading Post", "Tome of Goods", "Divination", "Scrolls", "Territories", "Guild", "Party", "Arcana"]) {
      await expect(frame.getByText(label, { exact: true })).toBeVisible();
    }
    const paths = frame.getByRole("menuitem", { name: "Paths" });
    await paths.hover();
    await expect(paths).toHaveAttribute("aria-expanded", "true");
    for (const label of ["By Role", "War Room", "Chronicles", "By Class", "Merchants", "Diviners"]) {
      await expect(frame.getByText(label, { exact: true })).toBeVisible();
    }
  } else if (id === "torch-ui/Popover") {
    await expect(frame.locator("button button")).toHaveCount(0);
    await button("🔥 Fireball").click();
    await expect(frame.getByText("3rd-level evocation · Range: 150 ft")).toBeVisible();
  } else if (id === "torch-ui/Table") {
    const body = frame.locator("tbody");
    await expect(body.locator(":scope > tr")).toHaveCount(3);
    await expect(body).toContainText("Lyra Swiftfoot");
    await expect(body).toContainText("Grimshaw Stone");
    expect(await body.evaluate(element => [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()).length)).toBe(0);
  } else if (id === "torch-ui/Register Form") {
    await expect(frame.locator('input[type="password"]')).toHaveAttribute("autocomplete", "new-password");
  } else if (id === "torch-ui/Settings Form") {
    await frame.getByRole("tab", { name: "Security" }).click();
    await expect(frame.getByLabel("Current password")).toHaveAttribute("autocomplete", "current-password");
    await expect(frame.getByPlaceholder("Choose a strong password")).toHaveAttribute("autocomplete", "new-password");
    await expect(frame.getByLabel("Confirm new password")).toHaveAttribute("autocomplete", "new-password");
  } else if (id === "torch-ui/Form Drawer") {
    await button("New project").click();
    const dialog = frame.getByRole("dialog", { name: "New project" });
    await expect(dialog).toBeVisible();
    const cancel = dialog.getByRole("button", { name: "Dismiss", exact: true });
    await expect(cancel).toHaveCount(1);
    await expect(cancel).toHaveText("Dismiss");
    await dialog.getByRole("button", { name: "Create project" }).click();
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Project name").fill("Col project");
    expect(await dialog.locator("form").evaluate(form => form.checkValidity())).toBe(true);
    await dialog.getByRole("button", { name: "Create project" }).click();
    await expect(dialog.getByRole("button", { name: "Creating…" })).toBeVisible();
    await expect(dialog, "saving a valid project closes the drawer").toHaveCount(0, { timeout: 10000 });
    await button("New project").click();
    await dialog.getByLabel("Project name").fill("Keyboard project");
    await dialog.getByLabel("Project name").dispatchEvent("keydown", { key: "Enter", isComposing: true });
    await dialog.getByLabel("Project name").dispatchEvent("keydown", { key: "Enter", isComposing: false, keyCode: 229 });
    await expect(dialog.getByRole("button", { name: "Create project" })).toBeVisible();
    await dialog.getByLabel("Project name").press("Enter");
    await expect(dialog, "Enter submits a valid project").toHaveCount(0, { timeout: 10000 });
    await button("New project").click();
    await cancel.click();
    await expect(dialog, "cancel closes the reopened drawer").toHaveCount(0, { timeout: 10000 });
  } else if (id === "torch-ui/Wizard Flow") {
    await button("Next").click();
    await expect(frame.getByText("Your account", { exact: true })).toBeVisible();
    await frame.getByPlaceholder("Caelan Torchward").fill("Col Tester");
    await frame.getByPlaceholder("you@company.com").fill("invalid");
    await frame.getByPlaceholder("you@company.com").press("Enter");
    await expect(frame.getByText("Your account", { exact: true })).toBeVisible();
    await frame.getByPlaceholder("you@company.com").fill("tester@example.com");
    await frame.getByPlaceholder("you@company.com").dispatchEvent("keydown", { key: "Enter", isComposing: true });
    await frame.getByPlaceholder("you@company.com").dispatchEvent("keydown", { key: "Enter", isComposing: false, keyCode: 229 });
    await expect(frame.getByText("Your account", { exact: true })).toBeVisible();
    await frame.getByPlaceholder("you@company.com").press("Enter");
    await button("Next").click();
    await expect(frame.getByText("Your organization", { exact: true })).toBeVisible();
    await frame.getByPlaceholder("Acme Corp").fill("Col");
    await frame.locator('input[type="checkbox"]').dispatchEvent("keydown", { key: "Enter" });
    await expect(frame.getByText("Your organization", { exact: true })).toBeVisible();
    await button("Next").click();
    await button("Finish setup").click();
    await expect(frame.getByText("You're all set!", { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(frame.getByText("Welcome, Col Tester.", { exact: false })).toBeVisible();
  } else {
    return false;
  }
  return true;
}
