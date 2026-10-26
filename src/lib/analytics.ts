import {repositoryUrl} from '../data/entity';

export type ConsentChoice = 'accepted' | 'refused';
export type PageType = 'landing' | 'docs' | 'agencies' | 'compare' | 'security' | 'privacy' | 'other';

export const consentStorageKey = 'pb-analytics-consent';

type Gtag = (...args: unknown[]) => void;
type AnalyticsWindow = Window & {dataLayer?: unknown[]; gtag?: Gtag} & Record<string, unknown>;

const subscribers = new Set<() => void>();
const quickstartBlocks = ['workers', 'docker', 'composer', 'npm'] as const;
const zeroResultDelayMs = 900;

let measurementId = '';
let started = false;
let tagRequested = false;
let configured = false;
let previousLocation = '';
let lastEmptySearch = '';
let searchTimer: number | undefined;

const win = () => window as unknown as AnalyticsWindow;

export function analyticsEnabled(): boolean {
  return measurementId !== '';
}

export function readConsent(): ConsentChoice | null {
  if (!analyticsEnabled()) return null;
  try {
    const value = window.localStorage.getItem(consentStorageKey);
    return value === 'accepted' || value === 'refused' ? value : null;
  } catch {
    return null;
  }
}

function storeConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(consentStorageKey, choice);
  } catch {
    return;
  }
}

export function subscribeConsent(listener: () => void): () => void {
  subscribers.add(listener);
  return () => {subscribers.delete(listener);};
}

function notify() {
  subscribers.forEach(listener => listener());
}

let sessionChoice: ConsentChoice | null = null;

export function currentConsent(): ConsentChoice | null {
  return sessionChoice ?? readConsent();
}

export function pageType(pathname = window.location.pathname): PageType {
  const route = pathname.replace(/\/$/, '') || '/';
  if (route === '/') return 'landing';
  if (route === '/docs' || route.startsWith('/docs/')) return 'docs';
  if (route === '/agencies') return 'agencies';
  if (route.startsWith('/compare/')) return 'compare';
  if (route === '/security') return 'security';
  if (route === '/privacy') return 'privacy';
  return 'other';
}

function ensureGtag(): Gtag {
  const w = win();
  w.dataLayer = w.dataLayer ?? [];
  if (!w.gtag) {
    w.gtag = function gtag() {
      // gtag.js only processes Arguments objects pushed to the data layer, not arrays.
      w.dataLayer!.push(arguments);
    };
  }
  return w.gtag;
}

function cleanLocation(href: string): string {
  try {
    const url = new URL(href, window.location.origin);
    return `${url.origin}${url.pathname}`;
  } catch {
    return '';
  }
}

function disableFlag(disabled: boolean) {
  win()[`ga-disable-${measurementId}`] = disabled;
}

function active(): boolean {
  return analyticsEnabled() && currentConsent() === 'accepted';
}

function sendPageView() {
  if (!active() || !configured) return;
  const location = cleanLocation(window.location.href);
  if (location === previousLocation) return;
  ensureGtag()('event', 'page_view', {
    page_location: location,
    page_referrer: previousLocation || cleanLocation(document.referrer),
    page_title: document.title,
  });
  previousLocation = location;
}

function loadTag() {
  const gtag = ensureGtag();
  if (!tagRequested) {
    tagRequested = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }
  if (!configured) {
    configured = true;
    gtag('js', new Date());
    gtag('config', measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: cleanLocation(window.location.href),
    });
  }
}

function grant() {
  disableFlag(false);
  ensureGtag()('consent', 'update', {analytics_storage: 'granted'});
  loadTag();
  sendPageView();
}

function expireAnalyticsCookies() {
  const names = document.cookie.split(';').map(part => part.split('=')[0].trim()).filter(name => name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name.startsWith('_gat'));
  const labels = window.location.hostname.split('.');
  const domains = ['', ...labels.map((_, index) => `.${labels.slice(index).join('.')}`)];
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`;
    }
  }
}

function revoke() {
  previousLocation = '';
  disableFlag(true);
  ensureGtag()('consent', 'update', {analytics_storage: 'denied'});
  expireAnalyticsCookies();
  window.clearTimeout(searchTimer);
}

export function setConsent(choice: ConsentChoice) {
  if (!analyticsEnabled()) return;
  sessionChoice = choice;
  storeConsent(choice);
  if (choice === 'accepted') grant(); else revoke();
  notify();
}

export function trackEvent(name: string, params: Record<string, string | number>) {
  if (!active() || !configured) return;
  ensureGtag()('event', name, params);
}

export function notePageView() {
  if (started) sendPageView();
}

function codeBlockKind(text: string): (typeof quickstartBlocks)[number] | null {
  if (/wrangler|cloudflare/i.test(text)) return 'workers';
  if (/\bdocker\b/i.test(text)) return 'docker';
  if (/\bcomposer\b/i.test(text)) return 'composer';
  if (/\b(npm|pnpm|yarn)\b/i.test(text)) return 'npm';
  return null;
}

function copyBlock(button: Element): (typeof quickstartBlocks)[number] | null {
  const label = button.getAttribute('aria-label') ?? '';
  const quickstart = /^Copy (Workers|Docker) commands$/.exec(label);
  if (quickstart) return quickstart[1].toLowerCase() as 'workers' | 'docker';
  const block = button.closest('.theme-code-block');
  if (!block || !/copy/i.test(label)) return null;
  return codeBlockKind(block.querySelector('pre')?.textContent ?? '');
}

function githubLocation(anchor: Element): 'hero' | 'footer' | 'docs' | 'other' {
  if (anchor.closest('footer')) return 'footer';
  if (anchor.closest('.pb-hero')) return 'hero';
  if (anchor.closest('.theme-doc-markdown, .theme-doc-sidebar-container, .theme-doc-footer')) return 'docs';
  return 'other';
}

function onClick(event: MouseEvent) {
  if (!active() || !(event.target instanceof Element)) return;
  const target = event.target;
  const page = pageType();

  const button = target.closest('button');
  if (button) {
    const vote = button.getAttribute('data-analytics-vote');
    if (vote === 'yes' || vote === 'no') {
      trackEvent('docs_helpful', {vote, page_type: page});
      return;
    }
    const block = copyBlock(button);
    if (block) trackEvent('copy_command', {block, page_type: page});
    return;
  }

  const anchor = target.closest('a[href]');
  if (anchor) {
    const href = anchor.getAttribute('href') ?? '';
    if (href === repositoryUrl || href.startsWith(`${repositoryUrl}/`) || href.startsWith(`${repositoryUrl}?`) || href.startsWith(`${repositoryUrl}#`)) {
      trackEvent('github_click', {location: githubLocation(anchor), page_type: page});
    }
  }
}

function checkEmptySearch() {
  if (!active()) return;
  const input = document.querySelector<HTMLInputElement>('.navbar__search-input');
  const empty = document.querySelector('[class*="noResults"]');
  if (!input || !empty || input.value.trim() === '' || input.value === lastEmptySearch) return;
  lastEmptySearch = input.value;
  trackEvent('search_zero_results', {result_count: 0, page_type: pageType()});
}

function watchSearch() {
  const observer = new MutationObserver(() => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(checkEmptySearch, zeroResultDelayMs);
  });
  observer.observe(document.body, {childList: true, subtree: true});
}

export function startAnalytics(id: string) {
  if (started || !id || typeof window === 'undefined') return;
  measurementId = id;
  started = true;
  const gtag = ensureGtag();
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
  disableFlag(true);
  document.addEventListener('click', onClick, true);
  watchSearch();
  sessionChoice = readConsent();
  if (sessionChoice === 'accepted') grant();
  notify();
}
