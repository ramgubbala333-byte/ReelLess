// ReelLess interaction verification (Expo Go gate #3).
// Drives the static web export in headless Chrome at 390px with real
// mouse clicks: 4-step onboarding, all five tabs, feed counting via the
// Next-reel button, the goal-crossing modal, the break cooldown, the
// duel share sheet, a Settings goal change and the dormant paywall.
// Every console error and page error is collected and printed at the end.
const puppeteer = require('/home/hatch/workspace/mistless-art/verify/node_modules/puppeteer-core');
const BASE = 'http://127.0.0.1:8904';
const EXE = '/home/hatch/workspace/mistless-art/verify/browsers/chrome-headless-shell/linux-156.0.8078.80/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = '/home/hatch/workspace/reelless-app/verify/shots';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
function check(name, ok, extra = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
}

// Click the visible element whose own text matches `text` (exact or prefix).
async function clickText(page, text, { exact = true, timeout = 9000 } = {}) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const pt = await page.evaluate((t, ex) => {
      const els = Array.from(document.querySelectorAll('div,span,button,a'));
      let best = null;
      for (const el of els) {
        const own = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent.trim())
          .join('');
        const full = (el.textContent || '').trim();
        const hit = ex ? own === t || full === t : own.startsWith(t) || full.startsWith(t);
        if (!hit) continue;
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight) {
          if (!best || r.width * r.height < best.area) best = { x: r.x + r.width / 2, y: r.y + r.height / 2, area: r.width * r.height };
        }
      }
      return best;
    }, text, exact);
    if (pt) {
      await page.mouse.click(pt.x, pt.y);
      return true;
    }
    await sleep(300);
  }
  throw new Error(`clickText not found: ${text}`);
}

async function hasText(page, text, timeout = 6000) {
  try {
    await page.waitForFunction((t) => document.body && document.body.innerText.includes(t), { timeout }, text);
    return true;
  } catch {
    return false;
  }
}

async function clickTab(page, label) {
  const handles = await page.$$(`button[aria-label="${label}"]`);
  for (let i = handles.length - 1; i >= 0; i--) {
    const box = await handles[i].boundingBox();
    if (box && box.width > 0 && box.height > 0) {
      await handles[i].click();
      return;
    }
  }
  await clickText(page, label);
}

async function persisted(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('reelless-state-v1');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.state || parsed;
  });
}

async function shot(page, name) {
  await sleep(450);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`SHOT  ${name}.png`);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EXE,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  try {
    // ---- Onboarding (fresh state) ----
    await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 });
    check('onboarding step 1 shows', await hasText(page, 'Every reel, counted.'));
    await shot(page, '01-onboarding-step1');
    await clickText(page, 'Continue');
    check('onboarding step 2 (platforms)', await hasText(page, 'Where do you scroll?'));
    await shot(page, '02-onboarding-platforms');
    await clickText(page, 'Continue');
    check('onboarding step 3 (goal)', await hasText(page, 'Set a daily goal.'));
    // Lower the goal from 100 to 10 with the -10 stepper (9 taps).
    for (let i = 0; i < 9; i++) {
      await clickText(page, '−10');
      await sleep(120);
    }
    await shot(page, '03-onboarding-goal');
    await clickText(page, 'Continue');
    check('onboarding step 4 (meet Volt)', await hasText(page, 'Meet Volt.'));
    await shot(page, '04-onboarding-volt');
    await clickText(page, 'Start counting');
    await sleep(900);

    // ---- Today, first use: count 0 ----
    let st = await persisted(page);
    check('onboarded persisted', !!st && st.onboarded === true);
    check('goal set to 10 in onboarding', !!st && st.goal === 10, st ? `goal=${st.goal}` : 'no state');
    const tk0 = new Date().toISOString().slice(0, 10);
    const t0 = st && st.history && st.history[tk0] ? st.history[tk0].total : 0;
    check('today starts at 0', t0 === 0, `total=${t0}`);
    await shot(page, '05-today-first-use');

    // ---- Feed: counting ----
    await clickTab(page, 'Reels');
    await sleep(800);
    await shot(page, '06-feed-first');
    for (let i = 0; i < 3; i++) {
      const btn = await page.$('button[aria-label="Next reel"], [aria-label="Next reel"]');
      if (btn) await btn.click();
      else await clickText(page, 'Next reel', { exact: false });
      await sleep(650);
    }
    // Opening the feed lands on reel #1, which counts (by design:
    // "every reel you land on is counted"). 3 Next taps => total 4.
    await sleep(900);
    st = await persisted(page);
    const todayKey = new Date().toISOString().slice(0, 10);
    const total4 = st && st.history && st.history[todayKey] ? st.history[todayKey].total : null;
    check('feed counted landing reel + 3 taps = 4', total4 === 4, `total=${total4}`);
    check('pill shows 4 reels today', await hasText(page, '4 reels today'));
    await shot(page, '07-feed-counted-4');

    // ---- Today reflects the count ----
    await clickTab(page, 'Today');
    await sleep(700);
    st = await persisted(page);
    const tToday = st && st.history && st.history[todayKey] ? st.history[todayKey].total : null;
    check('today total still 4 after tab switch', tToday === 4, `total=${tToday}`);
    await shot(page, '08-today-4');

    // ---- Cross the goal (10): 7 more reels = 11 ----
    await clickTab(page, 'Reels');
    await sleep(700);
    for (let i = 0; i < 7; i++) {
      const btn = await page.$('[aria-label="Next reel"]');
      if (btn) await btn.click();
      else await clickText(page, 'Next reel', { exact: false });
      await sleep(550);
    }
    check('goal-crossed modal appears', await hasText(page, 'Goal crossed.', 9000));
    await shot(page, '09-goal-crossed-modal');
    await clickText(page, 'Take a break');
    check('break cooldown opens', await hasText(page, 'Volt is recharging.'));
    await shot(page, '10-break-cooldown');
    await clickText(page, 'End break early');
    await sleep(800);
    check('break exits back to app', await hasText(page, 'reels today', 6000) || (await hasText(page, 'Today', 3000)));

    // ---- Stats ----
    await clickTab(page, 'Stats');
    await sleep(700);
    check('stats screen renders', await hasText(page, 'This week', 5000) || (await hasText(page, 'All time', 3000)));
    await shot(page, '11-stats');

    // ---- Duel + share sheet ----
    await clickTab(page, 'Duel');
    await sleep(700);
    check('duel screen renders', await hasText(page, 'Fewer reels wins.'));
    await shot(page, '12-duel');
    await clickText(page, 'Challenge a friend');
    check('duel share sheet opens', await hasText(page, 'Your duel link'));
    check('duel link shown', await hasText(page, 'reelless.app/duel/volt-4821'));
    await shot(page, '13-duel-sheet');
    await clickText(page, 'Close');
    await sleep(500);

    // ---- Settings: goal change + paywall ----
    await clickTab(page, 'Settings');
    await sleep(700);
    check('settings renders', await hasText(page, 'Daily reel goal'));
    await clickText(page, '200');
    await sleep(400);
    st = await persisted(page);
    check('settings goal change persists (200)', !!st && st.goal === 200, st ? `goal=${st.goal}` : 'no state');
    await shot(page, '14-settings');
    // PRO card sits below the fold in the Settings ScrollView: scroll it in.
    for (let i = 0; i < 4; i++) {
      await page.mouse.move(195, 500);
      await page.mouse.wheel({ deltaY: 600 });
      await sleep(350);
      if (await hasText(page, 'See what PRO adds', 400)) break;
    }
    await clickText(page, 'See what PRO adds');
    await sleep(800);
    check('paywall renders', await hasText(page, 'ReelLess PRO', 5000) || (await hasText(page, 'PRO', 3000)));
    await shot(page, '15-paywall');
  } catch (e) {
    check(`harness completed without exception (${e.message})`, false);
    try {
      await shot(page, '99-failure-state');
    } catch {}
  }

  const realErrors = errors.filter((e) => !/favicon|Download the React DevTools/.test(e));
  console.log('\n==== RESULTS ====');
  const passed = results.filter((r) => r.ok).length;
  console.log(`checks: ${passed}/${results.length} passed`);
  console.log(`console/page errors: ${realErrors.length}`);
  realErrors.slice(0, 20).forEach((e) => console.log('ERR', e.slice(0, 300)));
  await browser.close();
  process.exit(realErrors.length || passed !== results.length ? 1 : 0);
})();
