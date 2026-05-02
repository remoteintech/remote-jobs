#!/usr/bin/env node
// Auto-fix tool for outbound URLs in src/companies/*.md
//
// Reads link-check-results.csv produced by check-links.sh and:
//   1. Drops rows whose source file no longer exists (already cleaned up)
//   2. Re-verifies "suspicious" responses (403/429/999/connection failed) with a
//      browser-like User-Agent — catches throttling that fooled the first scan
//   3. Categorizes each URL: OK / SAFE_REDIRECT / REBRAND / NOT_FOUND / PARKED / THROTTLED
//   4. Applies SAFE_REDIRECT fixes (same registrable domain) across files
//   5. Writes a review plan for everything that needs human judgement
//
// Usage:
//   node fix-links.mjs --plan        # Produce link-fix-plan.md, no edits
//   node fix-links.mjs --apply       # Produce plan AND apply safe fixes
//   node fix-links.mjs --reverify    # Re-verify suspicious rows before planning (slow)

import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { lookup } from 'node:dns/promises';

// Repo root is one level up from this script's directory (scripts/).
const ROOT = resolve(import.meta.dirname, '..');
const CSV_IN = resolve(ROOT, 'link-check-results.csv');
const PLAN_OUT = resolve(ROOT, 'link-fix-plan.md');
const APPLIED_OUT = resolve(ROOT, 'link-fix-applied.log');
const COMPANIES_DIR = resolve(ROOT, 'src/companies');

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const REVERIFY = args.has('--reverify');

// Hosts that mean "this domain has lapsed and been picked up by a parking service".
// A redirect *into* one of these is a strong removal signal (the eco-mind pattern).
const PARKED_HOSTS = [
  'expireddomains.com',
  'sedoparking.com',
  'sedo.com',
  'parkingcrew.net',
  'bodis.com',
  'afternic.com',
  'dan.com',
  'hugedomains.com',
  'undeveloped.com',
  'godaddy.com/domainsearch',
  'namecheap.com/domains',
];
// Subdomain patterns common on hijacked / typosquat redirects (the Remote Garage pattern).
const PARKED_SUBDOMAIN_RE = /^(ww\d+|parking|park|expired)\./i;

// Browser-like UA used for re-verification.
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

// ---------- CSV parsing (simple — our writer quotes everything) ----------
function parseCsv(text) {
  const rows = [];
  let i = 0,
    field = '',
    row = [],
    inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i += 2;
      } else if (c === '"') {
        inQuotes = false;
        i++;
      } else {
        field += c;
        i++;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
        i++;
      } else if (c === ',') {
        row.push(field);
        field = '';
        i++;
      } else if (c === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
      } else if (c === '\r') {
        i++;
      } else {
        field += c;
        i++;
      }
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...data] = rows;
  return data
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, idx) => [h, r[idx]])));
}

// ---------- URL helpers ----------
function safeUrl(s) {
  try {
    return new URL(s);
  } catch {
    return null;
  }
}

// Public-suffix-light: returns the last two labels of a hostname.
// Good enough to call "github.com" and "www.github.com" the same registrable.
// Doesn't perfectly handle .co.uk etc., but for our use case (treating
// "blog.foo.co.uk" and "foo.co.uk" as same) we accept that.
function registrable(host) {
  if (!host) return '';
  const parts = host.toLowerCase().replace(/^www\./, '').split('.');
  if (parts.length <= 2) return parts.join('.');
  // Treat known 2-part TLDs as one
  const twoPartTlds = new Set(['co.uk', 'co.jp', 'com.br', 'com.au', 'co.in', 'co.nz', 'co.za']);
  const tail2 = parts.slice(-2).join('.');
  const tail3 = parts.slice(-3).join('.');
  if (twoPartTlds.has(tail2)) return tail3.split('.').slice(-3).join('.');
  return tail2;
}

function isParked(finalUrl) {
  const u = safeUrl(finalUrl);
  if (!u) return false;
  const host = u.hostname.toLowerCase();
  if (PARKED_SUBDOMAIN_RE.test(host)) return true;
  for (const ph of PARKED_HOSTS) {
    const [phHost, phPath] = ph.split('/', 2);
    if (host === phHost || host.endsWith('.' + phHost)) {
      if (!phPath || u.pathname.startsWith('/' + phPath)) return true;
    }
  }
  return false;
}

// ---------- Re-verification with a real browser UA ----------
async function reverify(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': BROWSER_UA,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
      },
      signal: controller.signal,
    });
    return { status: res.status, finalUrl: res.url, ok: res.ok };
  } catch (err) {
    // On fetch failure, distinguish "DNS doesn't resolve" (domain is silently dead)
    // from real bot-blocking by doing an explicit DNS lookup.
    const u = safeUrl(url);
    if (u) {
      try {
        await lookup(u.hostname);
        // DNS works — connection failure is bot-blocking / cert error / etc.
        return { status: 0, finalUrl: url, error: err.message };
      } catch {
        return { status: 0, finalUrl: url, error: 'DNS lookup failed', dnsDead: true };
      }
    }
    return { status: 0, finalUrl: url, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

// ---------- Classification ----------
const CLASS = {
  OK: 'OK',
  HTTPS_UPGRADE: 'HTTPS_UPGRADE', // http→https on identical host+path — always apply
  COSMETIC: 'COSMETIC', // trailing slash, www, :443 — skip (works either way)
  CAREERS_DEAD: 'CAREERS_DEAD', // careers/jobs path redirected to bare root — careers page gone
  SAFE_REDIRECT: 'SAFE_REDIRECT', // same registrable domain, meaningful path move — review-only
  REBRAND: 'REBRAND', // different registrable domain → human review
  NOT_FOUND: 'NOT_FOUND', // 404 / clearly broken
  PARKED: 'PARKED', // redirected into a parking service (eco-mind pattern)
  DEAD_DNS: 'DEAD_DNS', // host doesn't resolve in DNS — domain is silently dead
  THROTTLED: 'THROTTLED', // 403/429/999/connection failure — likely bot blocking
  UNKNOWN: 'UNKNOWN',
};

// Tracking params we should strip before comparing original vs final URL
const TRACKING_PARAMS = /^(utm_|gclid|fbclid|msclkid|mc_|ucbcb|cbrd|gh_src|_ga|_gl|sessionid|sid|ref|ref_)/i;
function stripTracking(u) {
  if (!u || !u.searchParams) return u;
  const drop = [];
  for (const k of u.searchParams.keys()) if (TRACKING_PARAMS.test(k)) drop.push(k);
  for (const k of drop) u.searchParams.delete(k);
  return u;
}
function isCareersPath(p) {
  return /(career|job|hiring|join|work|apply|vagas|vacanc)/i.test(p) && p !== '/';
}
// Final-URL paths that signal "the careers page is gone — landed on a generic dead-end page".
// Used in conjunction with the original being a careers URL.
const DEAD_END_PATHS = /^\/(oops|error|404|not-found|sorry|uas\/login|login|signin|sign-in|contact|about|about-us)\/?$/i;
// Locale-only path additions (added by geo-redirecting websites — not safe to lock in)
function isLocaleOnly(p) {
  if (!p || p === '/') return false;
  const seg = p.replace(/^\/+|\/+$/g, '').split('/');
  if (seg.length === 0) return false;
  return /^(intl|locale|lang|i18n|[a-z]{2}([-_][a-z]{2,3})?|us|uk|en|en-gb|en-us|en-uk|de|es|fr|pt-br|it|nl|jp|cn|au|ca)$/i.test(seg[0]);
}
const LOCALE_SEG_RE = /^(intl|locale|lang|i18n|[a-z]{2}([-_][a-z]{2,3})?|us|uk|en|en-gb|en-us|en-uk|de|es|fr|pt-br|it|nl|jp|cn|au|ca)$/i;
function localeSegments(p) {
  if (!p) return new Set();
  return new Set(
    p.split('/').filter(Boolean).filter((s) => LOCALE_SEG_RE.test(s))
  );
}
function stripLocale(p) {
  if (!p || p === '/') return p;
  const stripped = p
    .split('/')
    .filter(Boolean)
    .filter((s) => !LOCALE_SEG_RE.test(s));
  return '/' + stripped.join('/');
}
function isGeoBlock(p) {
  return /not-in-your-country|geo-block|region-restricted/i.test(p);
}

function classify(row) {
  const orig = safeUrl(row.original_url);
  const fin = safeUrl(row.resolved_url);
  const status = row.status_code;
  const expl = row.explanation;

  if (!orig) return { class: CLASS.UNKNOWN, reason: 'malformed original URL' };

  if (fin && isParked(fin.href)) {
    return { class: CLASS.PARKED, reason: `final URL on parked host: ${fin.hostname}` };
  }

  if (status === 'DNS' || /DNS lookup failed/i.test(expl)) {
    return { class: CLASS.DEAD_DNS, reason: 'host does not resolve in DNS' };
  }

  if (status === '404' || /Not found/i.test(expl)) {
    return { class: CLASS.NOT_FOUND, reason: '404' };
  }

  if (status === '403' || status === '429' || status === '999' || status === '525' || status === '522' || /Forbidden|HTTP 999|HTTP 5/.test(expl) || /Connection failed/i.test(expl)) {
    return { class: CLASS.THROTTLED, reason: `${status} ${expl}` };
  }

  if (status === '200' || /Redirects to final URL/i.test(expl)) {
    if (!fin || row.original_url === row.resolved_url) return { class: CLASS.OK, reason: '' };
    return classifyRedirect(orig, fin);
  }

  return { class: CLASS.UNKNOWN, reason: `${status} ${expl}` };
}

function classifyRedirect(orig, fin) {
  // Strip ALL query params before comparing — redirect-added params are almost
  // always tracking (akredirect, ssi, gh_src, etc.) and shouldn't trigger a "real" diff.
  const o2 = new URL(orig.href);
  const f2 = new URL(fin.href);
  o2.search = '';
  o2.hash = '';
  f2.search = '';
  f2.hash = '';
  // Normalize port :443 / :80 noise
  if ((f2.protocol === 'https:' && f2.port === '443') || (f2.protocol === 'http:' && f2.port === '80')) f2.port = '';
  if ((o2.protocol === 'https:' && o2.port === '443') || (o2.protocol === 'http:' && o2.port === '80')) o2.port = '';

  const oHostBare = o2.hostname.replace(/^www\./, '');
  const fHostBare = f2.hostname.replace(/^www\./, '');
  const oPath = o2.pathname.replace(/\/+$/, '') || '/';
  const fPath = f2.pathname.replace(/\/+$/, '') || '/';
  const samePath = oPath === fPath;
  const sameQuery = o2.search === f2.search;
  const sameHost = oHostBare === fHostBare;
  const sameReg = registrable(orig.hostname) === registrable(fin.hostname);

  // http → https on identical host+path → always apply
  if (orig.protocol === 'http:' && fin.protocol === 'https:' && sameHost && samePath && sameQuery) {
    return { class: CLASS.HTTPS_UPGRADE, reason: 'http→https' };
  }
  // www / trailing slash / port differences only
  if (sameReg && samePath && sameQuery && orig.protocol === fin.protocol) {
    return { class: CLASS.COSMETIC, reason: 'trivial host/slash/port difference' };
  }
  // Any redirect landing on a generic dead-end page (login, oops, error, etc.) is broken
  if (DEAD_END_PATHS.test(fPath)) {
    return { class: CLASS.CAREERS_DEAD, reason: `dead-end landing: ${fPath}` };
  }
  // Careers path redirected to bare root or non-careers path on same domain
  if (isCareersPath(oPath)) {
    if (fPath === '/') {
      return { class: CLASS.CAREERS_DEAD, reason: 'careers → /' };
    }
    if (sameReg && !isCareersPath(fPath)) {
      return { class: CLASS.CAREERS_DEAD, reason: `careers redirects away: ${oPath} → ${fPath}` };
    }
  }
  // Workable / Lever / Greenhouse: known ATS paths that redirect to a generic page = careers gone
  if (/(workable\.com|lever\.co|greenhouse\.io|grnh\.se)/i.test(orig.hostname) && fPath === '/') {
    return { class: CLASS.CAREERS_DEAD, reason: 'ATS careers page gone' };
  }
  // Different registrable → could be acquisition, rebrand, or domain takeover
  if (!sameReg) {
    return { class: CLASS.REBRAND, reason: `${orig.hostname} → ${fin.hostname}` };
  }
  // Subdomain changed (same registrable, different host) — too uncertain for auto-apply
  if (!sameHost) {
    return { class: CLASS.SAFE_REDIRECT, reason: `subdomain: ${orig.hostname} → ${fin.hostname}`, autoApply: false };
  }
  // Geo-block destination — definitely not the canonical URL
  if (isGeoBlock(fPath)) {
    return { class: CLASS.SAFE_REDIRECT, reason: `geo-block: ${fPath}`, autoApply: false };
  }
  // Locale segment inserted that wasn't there before — likely scan-region noise
  const oLocales = localeSegments(oPath);
  const fLocales = localeSegments(fPath);
  for (const seg of fLocales) {
    if (!oLocales.has(seg)) {
      return { class: CLASS.SAFE_REDIRECT, reason: `locale segment added: ${seg}`, autoApply: false };
    }
  }
  // If after stripping locale on both sides the paths match, it's pure locale noise
  if (stripLocale(fPath) === stripLocale(oPath) && fPath !== oPath) {
    return { class: CLASS.SAFE_REDIRECT, reason: `locale-only difference`, autoApply: false };
  }
  // Root → non-root redirect on same host is suspicious (could be marketing landing page)
  if (oPath === '/' && fPath !== '/') {
    return { class: CLASS.SAFE_REDIRECT, reason: `root→${fPath}`, autoApply: false };
  }
  // Same host, meaningful path move — auto-apply
  return { class: CLASS.SAFE_REDIRECT, reason: `path: ${oPath} → ${fPath}`, autoApply: true };
}

// ---------- File editing ----------
async function loadCompanyFiles() {
  const files = (await readdir(COMPANIES_DIR)).filter((f) => f.endsWith('.md'));
  const byPath = new Map();
  for (const f of files) {
    const full = resolve(COMPANIES_DIR, f);
    byPath.set(full, await readFile(full, 'utf8'));
  }
  return byPath;
}

function applyUrlReplacement(text, oldUrl, newUrl) {
  if (!text.includes(oldUrl)) return { text, count: 0 };
  // Plain string replace — URLs are distinctive enough to be safe
  const escaped = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, 'g');
  let count = 0;
  const out = text.replace(re, () => {
    count++;
    return newUrl;
  });
  return { text: out, count };
}

// ---------- Main ----------
const csvText = await readFile(CSV_IN, 'utf8');
const rows = parseCsv(csvText);
console.log(`Loaded ${rows.length} CSV rows`);

// Normalize source_file to absolute, drop rows whose source file no longer exists
for (const r of rows) {
  if (r.source_file && !r.source_file.startsWith('/')) {
    r.source_file = resolve(ROOT, r.source_file);
  }
}
const liveRows = rows.filter((r) => existsSync(r.source_file));
console.log(`${liveRows.length} rows reference live files (${rows.length - liveRows.length} stale)`);

// Optional re-verification of suspicious rows
if (REVERIFY) {
  const suspicious = liveRows.filter(
    (r) => classify(r).class === CLASS.THROTTLED || classify(r).class === CLASS.NOT_FOUND
  );
  console.log(`Re-verifying ${suspicious.length} suspicious URLs with browser UA...`);
  let done = 0;
  const concurrency = 8;
  for (let i = 0; i < suspicious.length; i += concurrency) {
    const batch = suspicious.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (r) => {
        const v = await reverify(r.original_url);
        if (v.status >= 200 && v.status < 400) {
          r.status_code = String(v.status);
          r.resolved_url = v.finalUrl;
          r.explanation =
            r.original_url === v.finalUrl ? 'OK (re-verified)' : 'Redirects to final URL (re-verified)';
        } else if (v.status === 404) {
          r.status_code = '404';
          r.explanation = 'Not found (broken link) [re-verified]';
        } else if (v.status > 0) {
          r.status_code = String(v.status);
          r.explanation = `HTTP ${v.status} [re-verified]`;
        } else if (v.dnsDead) {
          r.status_code = 'DNS';
          r.explanation = 'DNS lookup failed [re-verified] — domain not resolvable';
        } else {
          r.explanation = `Connection failed [re-verified: ${v.error || 'unknown'}]`;
        }
        done++;
      })
    );
    process.stdout.write(`  ${done}/${suspicious.length}\r`);
  }
  console.log(`\nRe-verification complete.`);
  // Persist updated CSV so subsequent --apply uses the better data
  const header = 'source_file,original_url,resolved_url,status_code,explanation,no_change_needed\n';
  const body = liveRows
    .map((r) =>
      [r.source_file, r.original_url, r.resolved_url, r.status_code, r.explanation, r.no_change_needed]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
  await writeFile(CSV_IN, header + body + '\n');
  console.log(`Updated ${CSV_IN}`);
}

// Classify
const buckets = { OK: [], HTTPS_UPGRADE: [], COSMETIC: [], CAREERS_DEAD: [], SAFE_REDIRECT: [], REBRAND: [], NOT_FOUND: [], PARKED: [], DEAD_DNS: [], THROTTLED: [], UNKNOWN: [] };
for (const r of liveRows) {
  const c = classify(r);
  r._class = c.class;
  r._reason = c.reason;
  r._autoApply = c.autoApply ?? null;
  buckets[c.class].push(r);
}
console.log('Classification:');
for (const [k, v] of Object.entries(buckets)) console.log(`  ${k}: ${v.length}`);

// Group by company file for the plan
const byCompany = new Map();
for (const r of liveRows) {
  const k = r.source_file;
  if (!byCompany.has(k)) byCompany.set(k, []);
  byCompany.get(k).push(r);
}

// Detect "company is dead" cases: website (frontmatter) is PARKED or persistently NOT_FOUND
const removalCandidates = [];
const careersToRemove = []; // careers_url broken, careers-dead, or moved to junk — website OK
const websiteToUpgrade = []; // website needs http→https or known-good rewrite
const careersToReplace = []; // careers_url has a SAFE same-domain rewrite
for (const [file, items] of byCompany) {
  if (!existsSync(file)) continue;
  const text = await readFile(file, 'utf8');
  const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;
  const fm = fmMatch[1];
  const websiteMatch = fm.match(/^website:\s*(.+?)\s*$/m);
  const careersMatch = fm.match(/^careers_url:\s*(.+?)\s*$/m);
  const website = websiteMatch?.[1]?.replace(/^["']|["']$/g, '');
  const careers = careersMatch?.[1]?.replace(/^["']|["']$/g, '');

  const websiteRow = items.find((r) => r.original_url === website);
  const careersRow = items.find((r) => r.original_url === careers);

  if (websiteRow?._class === CLASS.PARKED) {
    removalCandidates.push({ file, reason: `website on parked host (${websiteRow._reason})` });
    continue;
  }
  if (websiteRow?._class === CLASS.DEAD_DNS) {
    removalCandidates.push({ file, reason: 'website domain does not resolve (DNS dead)' });
    continue;
  }
  if (websiteRow?._class === CLASS.NOT_FOUND) {
    removalCandidates.push({ file, reason: 'website returns 404' });
    continue;
  }
  const websiteAutoApply = websiteRow?._class === CLASS.HTTPS_UPGRADE ||
    (websiteRow?._class === CLASS.SAFE_REDIRECT && websiteRow?._autoApply === true);
  if (websiteAutoApply) {
    websiteToUpgrade.push({ file, from: website, to: cleanFinalUrl(websiteRow.resolved_url), why: websiteRow._class });
  }
  if (careersRow?._class === CLASS.NOT_FOUND || careersRow?._class === CLASS.CAREERS_DEAD || careersRow?._class === CLASS.PARKED || careersRow?._class === CLASS.DEAD_DNS) {
    careersToRemove.push({ file, careers, why: careersRow._class });
  } else {
    const careersAutoApply = careersRow?._class === CLASS.HTTPS_UPGRADE ||
      (careersRow?._class === CLASS.SAFE_REDIRECT && careersRow?._autoApply === true);
    if (careersAutoApply) {
      careersToReplace.push({ file, from: careers, to: cleanFinalUrl(careersRow.resolved_url), why: careersRow._class });
    }
  }
}

// Strip ALL query params from a final URL before writing it back. Redirect-added
// params are nearly always tracking/session noise that shouldn't end up persisted.
function cleanFinalUrl(url) {
  const u = safeUrl(url);
  if (!u) return url;
  u.search = '';
  u.hash = '';
  if ((u.protocol === 'https:' && u.port === '443') || (u.protocol === 'http:' && u.port === '80')) u.port = '';
  return u.href;
}

// Apply only the safest changes:
//   - Remove parked-domain profiles (eco-mind pattern)
//   - Strip dead careers_url field (404 / CAREERS_DEAD / PARKED) when website is OK
//   - Upgrade website / careers_url from http to https on identical host+path
let applied = 0;
const appliedLog = [];

if (APPLY) {
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Remove profiles whose website is on a parking service or whose domain doesn't resolve
  for (const cand of removalCandidates) {
    if (
      cand.reason.startsWith('website on parked host') ||
      cand.reason.startsWith('website domain does not resolve')
    ) {
      await unlink(cand.file);
      appliedLog.push(`REMOVED ${basename(cand.file)} — ${cand.reason}`);
      applied++;
    }
  }
  // Strip dead careers_url
  for (const c of careersToRemove) {
    if (!existsSync(c.file)) continue;
    const text = await readFile(c.file, 'utf8');
    const re = new RegExp(`^careers_url:\\s*${escRe(c.careers)}\\s*\\n`, 'm');
    const next = text.replace(re, '');
    if (next !== text) {
      await writeFile(c.file, next);
      appliedLog.push(`${basename(c.file)}: removed careers_url (${c.why}): ${c.careers}`);
      applied++;
    }
  }
  // http→https upgrades on website
  for (const u of websiteToUpgrade) {
    if (!existsSync(u.file)) continue;
    const text = await readFile(u.file, 'utf8');
    const next = text.replaceAll(u.from, u.to);
    if (next !== text) {
      await writeFile(u.file, next);
      appliedLog.push(`${basename(u.file)}: website http→https: ${u.from} → ${u.to}`);
      applied++;
    }
  }
  // http→https upgrades on careers_url
  for (const u of careersToReplace) {
    if (!existsSync(u.file)) continue;
    const text = await readFile(u.file, 'utf8');
    const next = text.replaceAll(u.from, u.to);
    if (next !== text) {
      await writeFile(u.file, next);
      appliedLog.push(`${basename(u.file)}: careers_url ${u.why}: ${u.from} → ${u.to}`);
      applied++;
    }
  }
  await writeFile(APPLIED_OUT, appliedLog.join('\n') + '\n');
  console.log(`Applied ${applied} changes. Log: ${APPLIED_OUT}`);
}

// Always write the plan
const plan = [];
plan.push('# Link Fix Plan\n');
plan.push(`Generated: ${new Date().toISOString()}\n`);
plan.push(`Source: \`link-check-results.csv\` (${liveRows.length} live rows)\n\n`);
plan.push('## Summary\n');
for (const [k, v] of Object.entries(buckets)) plan.push(`- **${k}**: ${v.length}`);
plan.push('');
plan.push(`- Removal candidates (parked website or 404 website): ${removalCandidates.length}`);
plan.push(`- careers_url removals (broken/parked/dead careers): ${careersToRemove.length}`);
plan.push(`- website rewrites (https-upgrade or safe redirect): ${websiteToUpgrade.length}`);
plan.push(`- careers_url rewrites (https-upgrade or safe redirect): ${careersToReplace.length}`);
plan.push(`- SAFE_REDIRECT URL rewrites (review-only): ${buckets.SAFE_REDIRECT.length}`);
plan.push(`- COSMETIC redirects (skipped): ${buckets.COSMETIC.length}`);
plan.push(`- CAREERS_DEAD (careers→home): ${buckets.CAREERS_DEAD.length}`);
plan.push('');

plan.push('## Auto-apply (frontmatter): website rewrites\n');
plan.push('| File | From | To | Why |');
plan.push('|---|---|---|---|');
for (const u of websiteToUpgrade) plan.push(`| ${basename(u.file)} | ${u.from} | ${u.to} | ${u.why} |`);
plan.push('');
plan.push('## Auto-apply (frontmatter): careers_url rewrites\n');
plan.push('| File | From | To | Why |');
plan.push('|---|---|---|---|');
for (const u of careersToReplace) plan.push(`| ${basename(u.file)} | ${u.from} | ${u.to} | ${u.why} |`);
plan.push('');

plan.push('## Removal candidates (manual review unless --apply removes)\n');
plan.push('| File | Reason |');
plan.push('|---|---|');
for (const c of removalCandidates) plan.push(`| ${basename(c.file)} | ${c.reason} |`);
plan.push('');

plan.push('## Companies whose careers_url 404s (auto: remove field)\n');
plan.push('| File | careers_url |');
plan.push('|---|---|');
for (const c of careersToRemove) plan.push(`| ${basename(c.file)} | ${c.careers} |`);
plan.push('');

plan.push('## Rebrands / acquisitions (host changed → manual review)\n');
plan.push('| File | Original | Final |');
plan.push('|---|---|---|');
const rebrandsByCompany = new Map();
for (const r of buckets.REBRAND) {
  const k = basename(r.source_file);
  if (!rebrandsByCompany.has(k)) rebrandsByCompany.set(k, []);
  rebrandsByCompany.get(k).push(r);
}
for (const [k, arr] of [...rebrandsByCompany.entries()].sort()) {
  for (const r of arr) plan.push(`| ${k} | ${r.original_url} | ${r.resolved_url} |`);
}
plan.push('');

plan.push('## NOT_FOUND (manual: fix URL or remove company)\n');
plan.push('| File | URL | Final |');
plan.push('|---|---|---|');
const notFoundByCompany = new Map();
for (const r of buckets.NOT_FOUND) {
  const k = basename(r.source_file);
  if (!notFoundByCompany.has(k)) notFoundByCompany.set(k, []);
  notFoundByCompany.get(k).push(r);
}
for (const [k, arr] of [...notFoundByCompany.entries()].sort()) {
  for (const r of arr) plan.push(`| ${k} | ${r.original_url} | ${r.resolved_url} |`);
}
plan.push('');

plan.push('## THROTTLED (likely bot blocking — re-verify with --reverify)\n');
plan.push(`${buckets.THROTTLED.length} rows. Run \`node fix-links.mjs --reverify\` to re-check with a browser User-Agent.\n`);

await writeFile(PLAN_OUT, plan.join('\n'));
console.log(`Plan written: ${PLAN_OUT}`);
