import { expect, test } from '@playwright/test';

test('fetches a panel once and reopens it from the slug cache', async ({ page }, testInfo) => {
  let artifactRequests = 0;

  page.on('request', (request) => {
    if (request.url().includes('/note-panel-artifact/hashtable-in-javascript')) artifactRequests += 1;
  });

  await page.goto('/note');
  await page.getByRole('link', { name: 'JavaScript Hash Table' }).click();
  await expect(page).toHaveURL(/\/note\?n=hashtable-in-javascript$/);
  await expect(page.locator('[data-stack-slug="hashtable-in-javascript"]')).toHaveAttribute('data-panel-status', 'artifact');
  await expect(page.locator('[data-panel-slug="hashtable-in-javascript"] header')).toContainText('Javascript Hash Table');

  if (testInfo.project.name === 'mobile-chromium') {
    await page.evaluate(() => window.history.back());
  } else {
    await page.getByRole('button', { name: 'close hashtable-in-javascript' }).click();
  }
  await expect(page).toHaveURL(/\/note$/);
  await page.getByRole('link', { name: 'JavaScript Hash Table' }).click();
  await expect(page.locator('[data-panel-slug="hashtable-in-javascript"] header')).toContainText('Javascript Hash Table');
  expect(artifactRequests).toBe(1);
});

test('accepts generated image and srcset artifacts', async ({ page }) => {
  await page.goto('/note');
  await page.getByRole('link', { name: 'Vercel 도메인 등록' }).click();

  await expect(page.locator('[data-stack-slug="vercel-domain"]')).toHaveAttribute('data-panel-status', 'artifact');
  await expect(page.locator('[data-panel-slug="vercel-domain"] img').first()).toBeVisible();
});

test('restores cached panels with browser history', async ({ page }) => {
  await page.goto('/note');
  await page.getByRole('link', { name: 'CSRF (Cross-Site Request Forgery)' }).click();
  await expect(page.getByText('CSRF (Cross-Site Request Forgery)', { exact: true }).last()).toBeVisible();
  await expect(page).toHaveURL(/\/note\?n=csrf$/);

  await page.evaluate(() => window.history.back());
  await expect(page).toHaveURL(/\/note$/);
  await page.evaluate(() => window.history.forward());
  await expect(page.getByText('CSRF (Cross-Site Request Forgery)', { exact: true }).last()).toBeVisible();
});

test('delegates copy behavior for fetched panel HTML', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'mobile emulation does not provide a trusted clipboard gesture');

  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/note');
  await page.getByRole('link', { name: 'CSRF (Cross-Site Request Forgery)' }).click();

  const copy = page.getByRole('button', { name: 'Copy to clipboard' }).first();
  const source = await copy.evaluate((button) => button.closest('.code-block')?.querySelector('code')?.textContent ?? '');

  await copy.click({ force: true });
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(source);
});

test('shows wiki previews from fetched panel HTML', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'wiki previews are disabled on mobile');
  await page.goto('/note');
  await page.getByRole('link', { name: 'CSRF (Cross-Site Request Forgery)' }).click();

  const link = page.locator('[data-panel-slug="csrf"] a.wiki-link').filter({ hasText: 'XSS' }).first();

  await link.focus();
  await expect(page.getByRole('tooltip')).toContainText('XSS');
  await link.press('Escape');
  await expect(page.getByRole('tooltip')).toBeHidden();
});

test('keeps copy behavior on server-rendered blog code blocks', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'mobile emulation does not provide a trusted clipboard gesture');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/blog/agent-client-protocol');

  const copy = page.getByRole('button', { name: 'Copy to clipboard' }).first();
  const source = await copy.evaluate((button) => button.closest('.code-block')?.querySelector('code')?.textContent ?? '');

  await copy.click({ force: true });
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(source);
});

test('rejects unsafe artifacts and falls back to RSC navigation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'desktop fallback coverage is sufficient');
  await page.addInitScript(() => {
    (window as typeof window & { __artifactPwned?: boolean }).__artifactPwned = false;
  });
  await page.route('**/note-panel-artifact/hashtable-in-javascript', (route) => route.fulfill({
    contentType: 'text/html',
    body: '<div data-note-panel-artifact="1" data-panel-slug="hashtable-in-javascript" data-artifact-version="1"><section class="note-panel" data-panel-slug="hashtable-in-javascript"><img src="x" onerror="window.__artifactPwned=true"></section></div>',
  }));
  await page.route(/\/note\?n=hashtable-in-javascript/, async (route) => {
    if (route.request().headers().rsc === '1') await new Promise((resolve) => setTimeout(resolve, 300));

    await route.continue();
  });
  await page.goto('/note');
  await page.getByRole('link', { name: 'JavaScript Hash Table' }).click();

  await expect(page.locator('[data-keyboard-navigation]')).toHaveAttribute('aria-busy', 'true');
  await expect(page).toHaveURL(/\/note\?n=hashtable-in-javascript$/);
  await expect(page.locator('[data-panel-slug="hashtable-in-javascript"] header')).toContainText('Javascript Hash Table');
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __artifactPwned?: boolean }).__artifactPwned)).toBe(false);
});

test('rejects malformed artifact boundaries', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'desktop fallback coverage is sufficient');

  const unsafeArtifacts = [
    '<div data-note-panel-artifact="1" data-panel-slug="hashtable-in-javascript" data-artifact-version="1"><section class="note-panel" data-panel-slug="hashtable-in-javascript"><form action="https://example.com"><input></form></section></div>',
    '<div data-note-panel-artifact="1" data-panel-slug="hashtable-in-javascript" data-artifact-version="1"><section class="note-panel" data-panel-slug="hashtable-in-javascript"><div style="position:fixed;inset:0">overlay</div></section></div>',
    '<div data-note-panel-artifact="1" data-panel-slug="hashtable-in-javascript" data-artifact-version="1"><section class="note-panel" data-panel-slug="hashtable-in-javascript"><img src="https://example.com/track.png"></section></div>',
    '<div data-note-panel-artifact="1" data-panel-slug="hashtable-in-javascript" data-artifact-version="1"><section class="note-panel" data-panel-slug="hashtable-in-javascript"><button>phishing control</button></section></div>',
    '<div data-note-panel-artifact="1" data-panel-slug="hashtable-in-javascript" data-artifact-version="1"><section class="note-panel" data-panel-slug="hashtable-in-javascript"><svg><image xlink:href="javascript:alert(1)"></image></svg></section></div>',
    '<div data-note-panel-artifact="1" data-panel-slug="hashtable-in-javascript" data-artifact-version="1"><section class="note-panel" data-panel-slug="hashtable-in-javascript"><svg><image href="https://example.com/track.svg"></image></svg></section></div>',
    '<div data-note-panel-artifact="1" data-panel-slug="hashtable-in-javascript" data-artifact-version="1"><section class="note-panel" data-panel-slug="hashtable-in-javascript"><svg><filter><feImage href="https://example.com/track.svg"></feImage></filter></svg></section></div>',
    '<div data-note-panel-artifact="1" data-panel-slug="wrong" data-artifact-version="1"><section class="note-panel" data-panel-slug="wrong"></section></div>',
    '<div data-note-panel-artifact="1" data-panel-slug="hashtable-in-javascript" data-artifact-version="2"><section class="note-panel" data-panel-slug="hashtable-in-javascript"></section></div>',
    '<div data-note-panel-artifact="1" data-panel-slug="hashtable-in-javascript" data-artifact-version="1"><section class="note-panel" data-panel-slug="hashtable-in-javascript"></section></div><div data-note-panel-artifact="1"></div>',
  ];

  for (const body of unsafeArtifacts) {
    await page.route('**/note-panel-artifact/hashtable-in-javascript', (route) => route.fulfill({
      contentType: 'text/html',
      body,
    }), { times: 1 });
    await page.goto('/note');
    await page.getByRole('link', { name: 'JavaScript Hash Table' }).click();
    await expect(page.locator('[data-panel-slug="hashtable-in-javascript"] header')).toContainText('Javascript Hash Table');
  }
});
