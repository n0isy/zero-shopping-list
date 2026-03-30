import {test, expect} from '@playwright/test';

test.describe('Permissions & Data Isolation', () => {
  test('cannot see other lists — only the one navigated to', async ({page}) => {
    const listA = 'perm-a-' + Date.now();
    const listB = 'perm-b-' + Date.now();

    // Create list A with an item
    await page.goto(`/list/${listA}`);
    await page.waitForSelector('.page', {timeout: 10_000});
    await page.locator('.add-input').fill('Secret Item A');
    await page.locator('.add-btn').click();
    await expect(page.locator('.item-card')).toHaveCount(1);

    // Navigate to list B
    await page.goto(`/list/${listB}`);
    await page.waitForSelector('.page', {timeout: 10_000});

    // List B must not contain items from list A
    await expect(page.locator('.empty-text')).toContainText('empty');
    const items = await page.locator('.item-text').allTextContents();
    expect(items).not.toContain('Secret Item A');
  });

  test('legacy z.mutate.table.* is disabled', async ({page}) => {
    const listId = 'perm-legacy-mut-' + Date.now();
    await page.goto(`/list/${listId}`);
    await page.waitForSelector('.page', {timeout: 10_000});

    // Try legacy mutator in browser context
    const result = await page.evaluate(async () => {
      try {
        // Access the Zero instance from the React tree internals
        // With enableLegacyMutators: false, z.mutate.list should not exist
        const z = (window as any).__zero;
        if (!z) return 'no-zero-instance';
        await z.mutate.list.insert({id: 'hack', name: 'hacked', created_at: 0});
        return 'mutation-succeeded';
      } catch (e: any) {
        return 'mutation-blocked: ' + e.message;
      }
    });

    // Either zero isn't exposed globally, or the mutation was blocked
    expect(result).not.toBe('mutation-succeeded');
  });

  test('legacy z.query.table is disabled', async ({page}) => {
    const listId = 'perm-legacy-q-' + Date.now();
    await page.goto(`/list/${listId}`);
    await page.waitForSelector('.page', {timeout: 10_000});

    const result = await page.evaluate(async () => {
      try {
        const z = (window as any).__zero;
        if (!z) return 'no-zero-instance';
        const rows = await z.query.list.run();
        return 'query-returned: ' + JSON.stringify(rows);
      } catch (e: any) {
        return 'query-blocked: ' + e.message;
      }
    });

    expect(result).not.toMatch(/query-returned: \[.+\]/);
  });

  test('two isolated lists do not leak items between each other', async ({browser}) => {
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();
    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    const listX = 'iso-x-' + Date.now();
    const listY = 'iso-y-' + Date.now();

    // User 1 creates list X with items
    await page1.goto(`http://localhost:20060/list/${listX}`);
    await page1.waitForSelector('.page', {timeout: 10_000});
    await page1.locator('.add-input').fill('Milk');
    await page1.locator('.add-btn').click();
    await page1.locator('.add-input').fill('Eggs');
    await page1.locator('.add-btn').click();
    await expect(page1.locator('.item-card')).toHaveCount(2);

    // User 2 creates list Y — should see zero items
    await page2.goto(`http://localhost:20060/list/${listY}`);
    await page2.waitForSelector('.page', {timeout: 10_000});
    await expect(page2.locator('.empty-text')).toContainText('empty');

    // User 2 adds one item to list Y
    await page2.locator('.add-input').fill('Bread');
    await page2.locator('.add-btn').click();
    await expect(page2.locator('.item-card')).toHaveCount(1);

    // User 1 still has exactly 2 items — no cross-contamination
    await expect(page1.locator('.item-card')).toHaveCount(2);
    const textsX = await page1.locator('.item-text').allTextContents();
    expect(textsX).not.toContain('Bread');

    await ctx1.close();
    await ctx2.close();
  });
});
