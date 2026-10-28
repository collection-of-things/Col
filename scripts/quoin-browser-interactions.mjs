import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { expect } = require((process.env.PLAYWRIGHT_MODULE || 'playwright') + '/test');
expect.configure({ timeout: 5000 });

// Each case asserts an observable result, not merely that clicking did not throw.
export async function interact(name, f, page, capture) {
  const button = f.getByRole('button');
  const checked = async (role, index = 0) => {
    const control = f.locator(`[role="${role}"]`).nth(index);
    const before = await control.getAttribute('aria-checked');
    await control.press('Space');
    await expect(control).toHaveAttribute('aria-checked', before === 'true' ? 'false' : 'true');
  };
  const dialog = async (role) => {
    const trigger = button.first();
    await trigger.click();
    const popup = f.getByRole(role);
    await expect(popup).toBeVisible();
    await capture('open');
    await expect.poll(() => popup.evaluate(e => e.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Tab');
    await expect.poll(() => popup.evaluate(e => e.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(popup).toBeHidden();
    await expect(trigger).toBeFocused();
  };
  switch (name) {
    case 'Accordion': {
      const trigger = button.first();
      await trigger.press('Enter');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(f.getByText('Base UI is a library', { exact: false })).toBeVisible();
      await capture('expanded');
      await trigger.press('Enter');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      break;
    }
    case 'Alert Dialog': await dialog('alertdialog'); break;
    case 'Dialog': case 'Drawer': await dialog('dialog'); break;
    case 'Autocomplete': {
      const input = f.getByRole('combobox');
      await input.fill('App');
      await expect(f.getByRole('option', { name: 'Apple', exact: true })).toBeVisible();
      await capture('suggestions');
      await input.press('ArrowDown');
      await input.press('Enter');
      await expect(input).toHaveValue('Apple');
      break;
    }
    case 'Avatar':
      await expect(f.locator('.Root').last()).toHaveText('LT');
      await expect.poll(() => f.locator('.Root').first().evaluate(e => !!e.querySelector('img')?.naturalWidth || e.textContent === 'LT')).toBe(true);
      break;
    case 'Button':
      await button.press('Enter'); await expect(button).toHaveText('Count: 1');
      await button.press('Space'); await expect(button).toHaveText('Count: 2'); break;
    case 'Checkbox': await checked('checkbox'); break;
    case 'Checkbox Group':
      await checked('checkbox', 1);
      await expect(f.locator('[role="checkbox"]').first()).toHaveAttribute('aria-checked', 'true'); break;
    case 'Collapsible':
      await button.press('Enter'); await expect(f.getByText('alien-bean-pasta')).toBeVisible();
      await capture('expanded'); await button.press('Enter'); await expect(f.getByText('alien-bean-pasta')).toBeHidden(); break;
    case 'Combobox':
      await f.getByRole('button', { name: 'Show fruit' }).click();
      await expect(f.getByRole('option', { name: 'Banana', exact: true })).toBeVisible();
      await capture('options'); await f.getByRole('option', { name: 'Banana', exact: true }).click();
      await expect(f.getByText('Selected: Banana')).toBeVisible(); break;
    case 'Context Menu':
      await f.getByText('Right click here').click({ button: 'right' });
      await expect(f.getByRole('menuitem', { name: 'Play Next' })).toBeVisible();
      await capture('open'); await f.getByRole('menuitem', { name: 'Play Next' }).click();
      await expect(f.getByRole('menu')).toBeHidden(); break;
    case 'CSP Provider':
      await expect(f.locator('.Viewport')).toBeVisible();
      await expect.poll(() => f.locator('body style').count()).toBe(0);
      await f.locator('.Viewport').evaluate(e => e.scrollTop = 50);
      await expect.poll(() => f.locator('.Viewport').evaluate(e => e.scrollTop)).toBeGreaterThan(0); break;
    case 'Direction Provider':
      await f.getByRole('tab', { name: 'First', exact: true }).press('ArrowLeft');
      await expect(f.getByRole('tab', { name: 'Second', exact: true })).toBeFocused();
      await f.getByRole('tab', { name: 'Second', exact: true }).press('Enter');
      await expect(f.getByRole('tabpanel')).toHaveText('Second section'); break;
    case 'Field':
      await f.getByRole('textbox').fill('Naveed'); await f.getByRole('textbox').press('Tab');
      await expect(f.getByRole('textbox')).toHaveValue('Naveed');
      await expect(f.getByText('Please enter your name')).toBeHidden(); break;
    case 'Fieldset':
      await f.getByRole('textbox', { name: 'Company' }).fill('Col');
      await f.getByRole('textbox', { name: 'Tax ID' }).fill('1234');
      await expect(f.getByRole('textbox', { name: 'Company' })).toHaveValue('Col');
      await expect(f.getByRole('textbox', { name: 'Tax ID' })).toHaveValue('1234'); break;
    case 'Form':
      await button.click(); await expect(button).toBeDisabled();
      await expect(f.getByText('The example domain is not allowed')).toBeVisible();
      await capture('validation');
      await f.getByRole('textbox').fill('https://solidjs.com'); await button.click();
      await expect(button).toBeEnabled(); await expect(f.getByText('The example domain is not allowed')).toBeHidden();
      await f.getByRole('textbox').fill('https://example.com'); await button.click();
      await expect(button).toBeDisabled(); await f.getByRole('textbox').fill('https://solidjs.com');
      await expect(button).toBeEnabled(); await expect(f.getByText('The example domain is not allowed')).toBeHidden(); break;
    case 'Input': await f.getByRole('textbox').fill('Solid'); await expect(f.getByRole('textbox')).toHaveValue('Solid'); break;
    case 'Menu':
      await button.click();
      await f.getByRole('menuitem', { name: 'Share', exact: true }).press('ArrowRight');
      await expect(f.getByRole('menuitem', { name: 'Copy link', exact: true })).toBeVisible();
      await capture('submenu'); await f.getByRole('menuitem', { name: 'Copy link', exact: true }).click();
      await expect(f.locator('output')).toHaveText('Copy link selected');
      await expect(f.getByRole('menu')).toBeHidden(); break;
    case 'Menubar':
      await f.getByRole('menuitem', { name: 'File', exact: true }).click();
      await f.getByRole('menuitem', { name: 'Export', exact: true }).press('ArrowRight');
      await expect(f.getByRole('menuitem', { name: 'PDF', exact: true })).toBeVisible();
      await capture('submenu'); await f.getByRole('menuitem', { name: 'PDF', exact: true }).click();
      await expect(f.getByRole('menuitem', { name: 'PDF', exact: true })).toBeHidden();
      await expect(f.getByRole('menu')).toBeHidden();
      await expect(f.getByRole('menuitem', { name: 'Help', exact: true })).toBeDisabled(); break;
    case 'Meter': await expect(f.getByRole('meter')).toHaveAttribute('aria-valuenow', '24'); break;
    case 'Navigation Menu':
      await f.getByRole('button', { name: 'Overview', exact: true }).click();
      await expect(f.locator('.Popup')).toBeVisible(); await capture('open');
      await expect(f.locator('.Popup a').first()).toBeVisible();
      await page.keyboard.press('Escape'); await expect(f.locator('.Popup')).toBeHidden();
      await expect(f.getByRole('button', { name: 'Overview', exact: true })).toHaveAttribute('aria-expanded', 'false'); break;
    case 'Number Field': {
      const input = f.getByRole('textbox');
      await expect(input).toHaveValue('100');
      await button.last().click(); await expect(input).toHaveValue('101');
      await input.press('ArrowDown'); await expect(input).toHaveValue('100'); break;
    }
    case 'OTP Field':
      await f.getByRole('textbox').first().pressSequentially('1234');
      await expect(f.locator('output')).toHaveText('Code entered');
      await expect(f.getByRole('textbox', { name: 'Digit 4' })).toHaveValue('4'); break;
    case 'Popover':
      await button.click(); await expect(f.getByText('You are all caught up. Good job!')).toBeVisible();
      await capture('open'); await page.keyboard.press('Escape');
      await expect(f.getByText('You are all caught up. Good job!')).toBeHidden(); break;
    case 'Preview Card':
      await f.getByRole('link', { name: 'typography', exact: true }).hover();
      await expect(f.locator('.Popup')).toBeVisible(); await capture('open');
      await expect(f.locator('.Popup')).toContainText('Typography');
      await expect.poll(() => f.locator('.Popup img').evaluate(e => e.complete && e.naturalWidth > 0)).toBe(true); break;
    case 'Progress':
      await expect.poll(async () => Number(await f.getByRole('progressbar').getAttribute('aria-valuenow')), { timeout: 6000 }).toBeGreaterThan(20); break;
    case 'Radio': case 'Radio Group':
      await f.locator('[role="radio"]').nth(1).click();
      await expect(f.locator('[role="radio"]').nth(1)).toHaveAttribute('aria-checked', 'true');
      await expect(f.locator('[role="radio"]').first()).toHaveAttribute('aria-checked', 'false'); break;
    case 'Scroll Area':
      await f.locator('.Viewport').hover(); await page.mouse.wheel(0, 180);
      await expect.poll(() => f.locator('.Viewport').evaluate(e => e.scrollTop)).toBeGreaterThan(0); break;
    case 'Select':
      await f.getByRole('combobox').click(); await expect(f.getByRole('option', { name: 'Serif', exact: true })).toBeVisible();
      await capture('options'); await f.getByRole('option', { name: 'Serif', exact: true }).click();
      await expect(f.getByRole('combobox')).toHaveText('Serif'); break;
    case 'Separator': await expect(f.getByRole('separator')).toBeVisible(); break;
    case 'Slider': {
      const slider = f.getByRole('slider');
      await slider.press('ArrowRight'); await expect(slider).toHaveAttribute('aria-valuenow', '26');
      await slider.press('Home'); await expect(slider).toHaveAttribute('aria-valuenow', '0');
      await slider.press('End'); await expect(slider).toHaveAttribute('aria-valuenow', '100'); break;
    }
    case 'Switch': await checked('switch'); break;
    case 'Tabs':
      await f.getByRole('tab', { name: 'Projects' }).click();
      await expect(f.getByRole('tab', { name: 'Projects' })).toHaveAttribute('aria-selected', 'true');
      await f.getByRole('tab', { name: 'Projects' }).press('ArrowRight');
      await expect(f.getByRole('tab', { name: 'Account' })).toBeFocused();
      await f.getByRole('tab', { name: 'Account' }).press('Enter');
      await expect(f.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
      await expect(f.getByRole('tabpanel')).toBeVisible(); break;
    case 'Toast':
      await f.getByRole('button', { name: 'Create toast' }).click();
      await f.locator('.Toast').hover();
      await expect(f.getByText(/Toast \d+ created/)).toBeVisible(); await capture('notification');
      await f.getByRole('button', { name: 'Close', exact: true }).click();
      await expect(f.getByText(/Toast \d+ created/)).toBeHidden(); break;
    case 'Toggle': {
      const before = await button.getAttribute('aria-pressed'); await button.press('Space');
      await expect(button).toHaveAttribute('aria-pressed', before === 'true' ? 'false' : 'true'); break;
    }
    case 'Toggle Group':
      await f.getByRole('button', { name: 'Align center' }).click();
      await expect(f.getByRole('button', { name: 'Align center' })).toHaveAttribute('aria-pressed', 'true');
      await expect(f.getByRole('button', { name: 'Align left' })).toHaveAttribute('aria-pressed', 'false'); break;
    case 'Toolbar':
      await f.getByRole('button', { name: 'Align left' }).click();
      await expect(f.getByRole('button', { name: 'Align left' })).toHaveAttribute('aria-pressed', 'true');
      await f.getByRole('combobox').click();
      await f.getByRole('option', { name: 'Arial', exact: true }).click();
      await expect(f.getByRole('combobox')).toHaveText('Arial'); break;
    case 'Tooltip':
      await f.getByRole('button', { name: 'Bold' }).focus();
      await expect(f.getByRole('tooltip')).toContainText('Bold'); await capture('open');
      await page.keyboard.press('Escape'); await expect(f.getByRole('tooltip')).toBeHidden(); break;
    default: throw new Error(`Missing interaction case: ${name}`);
  }
}
