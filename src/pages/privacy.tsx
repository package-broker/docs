import MarketingLayout, {PageSection} from '../components/marketing/MarketingLayout';
import ConsentSwitch from '../components/consent/ConsentSwitch';
import {useConsent} from '../components/consent/useConsent';
import {maintainer} from '../data/entity';
import {repository} from '../data/landing';

const privacyAddress = 'privacy@package.broker';
const description = 'Read how package.broker measures visits with Google Analytics only after you accept, what the four events contain, and how to withdraw consent.';

function Choice() {
  const {ready, enabled} = useConsent();
  if (!ready) return null;
  if (!enabled) return <p>Analytics is not active on this site. Nothing is sent to Google, and no choice is stored in your browser.</p>;
  return <>
    <p>Analytics is off until you accept. Use the switch to allow it or to withdraw consent. The choice is stored in your browser (<code>localStorage</code>) and on no server. Withdrawing stops all sending to Google Analytics at once and clears the Google Analytics cookies this site can reach.</p>
    <ConsentSwitch/>
  </>;
}

export default function Privacy() {
  return <MarketingLayout title="Privacy at Package Broker" description={description}>
    <div className="pb-hero pb-hero--page"><p className="pb-eyebrow">Privacy</p><h1>Privacy at Package Broker</h1>
      <p className="pb-hero__sub">This page covers the package.broker website. It does not cover a broker you run yourself.</p></div>
    <PageSection id="controller" title="Who is responsible">
      <p>Package Broker is maintained by <a className="pb-link" href={maintainer.url}>{maintainer.name}</a>. Send privacy questions, objections and consent withdrawals to <a className="pb-link" href={`mailto:${privacyAddress}`}>{privacyAddress}</a>.</p>
    </PageSection>
    <PageSection id="analytics" title="Google Analytics 4">
      <p>With your consent, this site uses Google Analytics 4 to count page views and three interactions, so the maintainer can see which pages and commands readers use. Before you choose, the site loads no Google script and sends no request to Google.</p>
      <p>After you accept, the site sends these to Google Analytics:</p>
      <ul>
        <li>Page views, with the page address and the previous page address, both without query strings.</li>
        <li><code>copy_command</code>: you copied a quickstart or install command. It names the command group (<code>workers</code>, <code>docker</code>, <code>composer</code> or <code>npm</code>) and the page type.</li>
        <li><code>github_click</code>: you followed a link to the <a className="pb-link" href={repository}>Package Broker repository on GitHub</a>. It names where the link sits (<code>hero</code>, <code>footer</code>, <code>docs</code> or <code>other</code>) and the page type.</li>
        <li><code>search_zero_results</code>: a documentation search found nothing. It carries a result count of zero and the page type. It never carries what you typed.</li>
      </ul>
      <p>Google also receives the technical data any web request carries, such as your IP address and browser details. Google Signals and ad personalization are switched off for the property, and the site grants Google analytics storage only, never advertising storage.</p>
    </PageSection>
    <PageSection id="choice" title="Your choice">
      <Choice/>
    </PageSection>
    <PageSection id="basis" title="Legal basis">
      <p>The site relies on your consent for Google Analytics. It does not treat Google Analytics as exempt from consent, so it asks first and keeps asking only if you have not chosen. You can refuse without losing access to anything on the site.</p>
    </PageSection>
    <PageSection id="retention" title="Retention">
      <p>The Google Analytics property uses the shortest data retention option that Google offers for it. Your consent choice stays in your browser until you change it or clear site data.</p>
    </PageSection>
    <PageSection id="cloudflare" title="Cloudflare Web Analytics">
      <p>The site also uses Cloudflare Web Analytics to measure Core Web Vitals, which describe page speed. Cloudflare states that it does not use client-side state such as cookies or <code>localStorage</code> for analytics purposes. This measurement is separate from the choice on this page, and the switch above does not control it.</p>
    </PageSection>
  </MarketingLayout>;
}
