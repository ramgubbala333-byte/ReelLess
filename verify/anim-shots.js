// Animation-pass screenshots: drives the same flow as run.js, then waits
// for the new RN Animated motion to settle before capturing:
//  (a) Today with Volt mid-drain (tired state, fill eased to 30%)
//  (b) the goal-crossed modal after its spring entrance
const puppeteer = require('/home/hatch/workspace/mistless-art/verify/node_modules/puppeteer-core');
const BASE = 'http://127.0.0.1:8904';
const EXE = '/home/hatch/workspace/mistless-art/verify/browsers/chrome-headless-shell/linux-156.0.8078.80/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = '/home/hatch/workspace/reelless-app/verify/shots';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

async function tapNext(page, times) {
  for (let i = 0; i < times; i++) {
    const btn = await page.$('[aria-label="Next reel"]');
    if (btn) await btn.click();
    await sleep(600);
  }
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
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));

  // Onboard with goal 10 (same as run.js).
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 });
  await clickText(page, 'Continue');
  await clickText(page, 'Continue');
  for (let i = 0; i < 9; i++) {
    await clickText(page, '−10');
    await sleep(120);
  }
  await clickText(page, 'Continue');
  await clickText(page, 'Start counting');
  await sleep(900);

  // Count 7 reels (landing + 6 taps) -> Volt tired at 30% charge.
  await clickTab(page, 'Reels');
  await sleep(800);
  await tapNext(page, 6);
  await sleep(600);
  await clickTab(page, 'Today');
  await sleep(1200); // fill ease (600ms) + droop settle (800ms) complete
  await page.screenshot({ path: `${OUT}/today-volt-mid-anim.png` });
  console.log('SHOT  today-volt-mid-anim.png');

  // Cross the goal: 4 more reels -> 11 total, modal springs in.
  await clickTab(page, 'Reels');
  await sleep(700);
  await tapNext(page, 4);
  await page.waitForFunction(() => document.body.innerText.includes('Goal crossed.'), { timeout: 9000 });
  await sleep(900); // spring entrance + Volt empty flicker settled
  await page.screenshot({ path: `${OUT}/goal-crossed-anim.png` });
  console.log('SHOT  goal-crossed-anim.png');

  console.log(`console/page errors: ${errors.length}`);
  errors.slice(0, 10).forEach((e) => console.log('ERR', e.slice(0, 200)));
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
