import {test, expect} from '@playwright/test';

const BASE = 'http://localhost:20060';

test.describe('Shopping List', () => {
  let listId: string;

  test.beforeAll(() => {
    listId = 'e2e-' + Date.now();
  });

  test.describe.configure({mode: 'serial'});

  test('homepage redirects to /list/:id', async ({page}) => {
    await page.goto('/');
    await page.waitForURL(/\/list\/.+/, {timeout: 10_000});
    expect(page.url()).toMatch(/\/list\/.+/);
  });

  test('new list shows empty state', async ({page}) => {
    await page.goto(`/list/${listId}`);
    await page.waitForSelector('.page', {timeout: 10_000});

    await expect(page.locator('.header-title')).toContainText('Shopping List');
    await expect(page.locator('.empty-text')).toContainText('empty');
  });

  test('add items', async ({page}) => {
    await page.goto(`/list/${listId}`);
    await page.waitForSelector('.page', {timeout: 10_000});

    // Add three items
    for (const name of ['Milk', 'Bread', 'Eggs']) {
      await page.locator('.add-input').fill(name);
      await page.locator('.add-btn').click();
    }

    await expect(page.locator('.item-card')).toHaveCount(3);
    await expect(page.locator('.counter')).toContainText('3 items');

    // Verify item texts
    const texts = await page.locator('.item-text').allTextContents();
    expect(texts).toContain('Milk');
    expect(texts).toContain('Bread');
    expect(texts).toContain('Eggs');
  });

  test('toggle item marks it checked', async ({page}) => {
    await page.goto(`/list/${listId}`);
    await page.waitForSelector('.item-card', {timeout: 10_000});

    await page.locator('.item-card').first().click();
    await expect(page.locator('.item-card.checked')).toHaveCount(1);
    await expect(page.locator('.counter')).toContainText('1 done');
  });

  test('delete item removes it', async ({page}) => {
    await page.goto(`/list/${listId}`);
    await page.waitForSelector('.item-card', {timeout: 10_000});

    const countBefore = await page.locator('.item-card').count();
    await page.locator('.item-delete').first().click();
    await expect(page.locator('.item-card')).toHaveCount(countBefore - 1);
  });

  test('clear checked removes checked items', async ({page}) => {
    await page.goto(`/list/${listId}`);
    await page.waitForSelector('.item-card', {timeout: 10_000});

    // Check an unchecked item first
    const unchecked = page.locator('.item-card:not(.checked)').first();
    await unchecked.click();
    await expect(page.locator('.item-card.checked')).not.toHaveCount(0);

    // Clear checked
    await page.locator('.clear-checked').click();
    await expect(page.locator('.item-card.checked')).toHaveCount(0);
  });

  test('share modal opens and closes', async ({page}) => {
    await page.goto(`/list/${listId}`);
    await page.waitForSelector('.page', {timeout: 10_000});

    await page.locator('[aria-label="Share list"]').click();
    await expect(page.locator('.modal-overlay')).toBeVisible();
    await expect(page.locator('.modal')).toContainText('Share');

    // Close via button
    await page.locator('.modal-actions .btn-ghost').click();
    await expect(page.locator('.modal-overlay')).not.toBeVisible();
  });
});

test.describe('Real-time sync', () => {
  test('two tabs see the same data', async ({browser}) => {
    const listId = 'sync-' + Date.now();

    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();
    const tab1 = await ctx1.newPage();
    const tab2 = await ctx2.newPage();

    // Tab 1: create list + add item
    await tab1.goto(`${BASE}/list/${listId}`);
    await tab1.waitForSelector('.page', {timeout: 10_000});
    await tab1.locator('.add-input').fill('Apples');
    await tab1.locator('.add-btn').click();
    await expect(tab1.locator('.item-card')).toHaveCount(1);

    // Tab 2: open same list — should see the item
    await tab2.goto(`${BASE}/list/${listId}`);
    await tab2.waitForSelector('.page', {timeout: 10_000});
    await expect(tab2.locator('.item-card')).toHaveCount(1);
    await expect(tab2.locator('.item-text').first()).toContainText('Apples');

    // Tab 2: add another item
    await tab2.locator('.add-input').fill('Bananas');
    await tab2.locator('.add-btn').click();
    await expect(tab2.locator('.item-card')).toHaveCount(2);

    // Tab 1: should see both items after sync
    await expect(tab1.locator('.item-card')).toHaveCount(2, {timeout: 5_000});

    await ctx1.close();
    await ctx2.close();
  });
});
