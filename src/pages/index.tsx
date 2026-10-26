import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import Quickstart from '../components/landing/Quickstart';
import HowItWorks from '../components/landing/HowItWorks';
import Operations from '../components/landing/Operations';
import {LandingFooter} from '../components/landing/SiteChrome';
import HeroAuthJson from '../components/landing/visuals/HeroAuthJson';
import KeysMap from '../components/landing/visuals/KeysMap';
import OutageFlow from '../components/landing/visuals/OutageFlow';
import OffboardingTimeline from '../components/landing/visuals/OffboardingTimeline';
import {FreelancerIcon, NoSeatsIcon, OffboardingIcon, OutageIcon} from '../components/landing/visuals/ValueIcons';
import styles from '../components/landing/Home.module.css';
import {releaseStatus, repository} from '../data/landing';
import {definition, runtimeSentence, releasesFeed} from '../data/entity';
import contacts from '../data/contacts.json';

const marketplaceStatus = 'Marketplace sources: built, in final verification.';

function ReleaseNotification() {
  return <div className="pb-faq"><details id="get-notified">
    <summary>Get notified of the first release</summary>
    <div className="pb-faq__answer">
    <ol>
      <li>Open the <a className="pb-link" href={repository}>Package Broker repository on GitHub</a> and select <strong>Watch</strong>.</li>
      <li>Select <strong>Custom</strong>.</li>
      <li>Select <strong>Releases</strong> and apply your choices.</li>
    </ol>
    <p>Or subscribe to the <a className="pb-link" href={releasesFeed}>Atom release feed</a>.</p>
    </div>
  </details></div>;
}

function Section({id, title, description, children}: {id: string; title: string; description?: string; children: ReactNode}) {
  return <div className="pb-wrap"><section className="pb-section" id={id} aria-labelledby={`${id}-title`}>
    <div className="pb-section__head"><h2 id={`${id}-title`}>{title}</h2>{description && <p>{description}</p>}</div>
    {children}
  </section></div>;
}

export default function Home() {
  const {collectAnchor} = useBrokenLinks();
  for (const id of ['hero', 'get-notified', 'before-after', 'outages', 'offboarding', 'how-it-works', 'cost', 'what-you-run', 'status', 'quickstart', 'footer']) collectAnchor(id);
  return (
    <Layout title="Self-hosted private Composer and npm registry" description="A self-hosted private Composer and npm registry with role-based access per project: one token per developer, vendor keys kept in the broker." noFooter>
      <div className="pb-site">
        <main id="main" tabIndex={-1}>
          <div className="pb-wrap"><div className="pb-section pb-section--first pb-hero-grid">
            <section className={`pb-hero ${styles.hero}`} id="hero" aria-labelledby="hero-title">
              <p className="pb-eyebrow">Private Composer and npm registry with role-based access</p>
              <h1 id="hero-title" className={styles.headline}><span>One token per developer.</span> <span className={styles.highlight}>Client keys stay in the broker,</span> <span>not on laptops.</span></h1>
              <p className="pb-legend">{definition} {runtimeSentence}</p>
              <p className="pb-hero__sub">Marketplace and vendor keys are stored per client project; developers and CI get broker tokens. Every archive installed through the broker is stored by the broker, so deploys keep working when a vendor repository is down.</p>
              <ul className={styles.benefits}>
                <li><OffboardingIcon size="sm"/><span><strong>Offboarding through your identity provider:</strong> remove someone from the group and access ends within 24 hours; no vendor keys on laptops to rotate.</span></li>
                <li><FreelancerIcon size="sm"/><span><strong>A freelancer on one client:</strong> grant one project; every other project returns 404. They sign in through your identity provider.</span></li>
                <li><OutageIcon size="sm"/><span><strong>Installs that survive vendor repository outages</strong> for every version already installed through the broker.</span></li>
              </ul>
              <div className={`pb-actions ${styles.actions}`}>
                <Link className="pb-btn pb-btn--primary pb-btn--lg" to="#quickstart">Start the quickstart</Link>
                <ReleaseNotification/>
              </div>
              <p className={`pb-legend ${styles.legend}`}>{releaseStatus}. {marketplaceStatus} <Link className="pb-link" to="/compare/private-packagist">Compare with Private Packagist</Link></p>
            </section>
            <HeroAuthJson/>
          </div></div>

          <Section id="before-after" title="What changes for your team">
            <KeysMap/>
            <p><Link className="pb-link" to="/docs/guides/mirror-vendor-repositories">Marketplace keys per client project</Link></p>
          </Section>

          <Section id="outages" title="Deploys that don’t wait for a vendor repository" description="Every archive installed through the broker is stored by the broker and served from that copy before any request to the vendor repository.">
            <OutageFlow/>
          </Section>

          <Section id="offboarding" title="When someone leaves" description="Access granted through an identity provider group follows that group. After a one-time rotation when you move existing keys into the broker, nobody holds vendor keys to rotate.">
            <OffboardingTimeline/>
          </Section>

          <Section id="how-it-works" title="How it works" description="One deployment is one organization. Give each client a project and select its sources with that client’s credentials. Sign-in uses Cloudflare Access or an OpenID Connect provider such as Dex, and its groups grant project access. Composer and npm authenticate with a token; CI gets a read-only service token bound to one project.">
            <HowItWorks/>
          </Section>

          <Section id="cost" title="No seat counting">
            <div className={styles.seats}><NoSeatsIcon size="lg"/><p>The software does not count or cap users. Add juniors, freelancers, QA and CI pipelines without a new licence line. No licence fee: you pay for your own hosting, from USD 5 a month on Cloudflare Workers Paid plus usage, or your own Node host with Docker.</p></div>
          </Section>

          <Section id="what-you-run" title="What you run" description="You operate the broker. These are the requirements and responsibilities for each runtime.">
            <Operations/>
          </Section>

          <Section id="status" title="Status and maintainer">
            <p>{releaseStatus}. {marketplaceStatus} Maintained by <a className="pb-link" href="https://github.com/lbajsarowicz">lbajsarowicz</a>, AGPL-3.0-only. If the project stops, your deployment keeps running: the code is AGPL and your data stays in your own D1 and R2, or SQLite and your blob store.</p>
            <p>The first planned tag is <code>v2.0.0-rc.1</code> (<Link className="pb-link" to="/docs/decisions/release-and-versioning">Release and versioning</Link>). A live Marketplace install on Cloudflare Workers and a Node host with Docker still needs to be recorded, and container image publishing is planned. Follow the <a className="pb-link" href={`${repository}/pulls`}>open release pull request</a> and <a className="pb-link" href={`${repository}/commits/main`}>recent commits</a> for progress.</p>
            <p>Getting help: report bugs in <a className="pb-link" href={`${repository}/issues`}>GitHub issues</a>, ask questions in <a className="pb-link" href={`${repository}/discussions`}>GitHub Discussions</a>, send private matters to <a className="pb-link" href={`mailto:${contacts.support}`}>{contacts.support}</a>, and report security concerns through <Link className="pb-link" to="/security">Security</Link>.</p>
            <p>To evaluate alone you do not need an identity provider: setup creates a local administrator protected by a password and an authenticator app.</p>
            <p>Removing someone from a group ends their access after the revalidation window; service tokens they created for CI stay valid until you revoke them. <Link className="pb-link" to="/docs/decisions/identity-and-sessions">Session and membership revalidation</Link>.</p>
            <p>Package Broker 1.x is no longer maintained (<a className="pb-link" href="https://github.com/package-broker/server">package-broker/server</a>).</p>
            <p><Link className="pb-link" to="#get-notified">Get notified of the first release</Link></p>
          </Section>

          <div className="pb-wrap"><div className="pb-section"><Quickstart/></div></div>
        </main>
        <LandingFooter/>
      </div>
    </Layout>
  );
}
