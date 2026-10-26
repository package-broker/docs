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

const marketplaceStatus = 'Marketplace sources: built, in final verification.';

function Section({id, title, description, children}: {id: string; title: string; description?: string; children: ReactNode}) {
  return <div className="pb-wrap"><section className="pb-section" id={id} aria-labelledby={`${id}-title`}>
    <div className="pb-section__head"><h2 id={`${id}-title`}>{title}</h2>{description && <p>{description}</p>}</div>
    {children}
  </section></div>;
}

export default function Home() {
  const {collectAnchor} = useBrokenLinks();
  for (const id of ['hero', 'before-after', 'outages', 'offboarding', 'how-it-works', 'cost', 'what-you-run', 'status', 'quickstart', 'footer']) collectAnchor(id);
  return (
    <Layout title="Private Composer and npm registry" description="Private Composer and npm registry for Magento and PHP agencies: one token per developer, client keys in the broker, stored archives for deploys." noFooter>
      <div className="pb-site">
        <main id="main" tabIndex={-1}>
          <div className="pb-wrap"><div className="pb-section pb-section--first pb-hero-grid">
            <section className="pb-hero" id="hero" aria-labelledby="hero-title">
              <p className="pb-eyebrow">Private Composer and npm registry for Magento and PHP agencies</p>
              <h1 id="hero-title">One token per developer. Client keys stay in the broker, not on laptops.</h1>
              <p className="pb-hero__sub">Marketplace and vendor keys are stored per client project; developers and CI get broker tokens. Every archive installed through the broker is stored by the broker, so deploys keep working when a vendor repository is down.</p>
              <ul className={styles.benefits}>
                <li><OffboardingIcon size="sm"/><span><strong>Offboarding through your identity provider:</strong> remove someone from the group and access ends within 24 hours; no vendor keys on laptops to rotate.</span></li>
                <li><FreelancerIcon size="sm"/><span><strong>A freelancer on one client:</strong> grant one project; every other project returns 404. They sign in through your identity provider.</span></li>
                <li><OutageIcon size="sm"/><span><strong>Installs that survive vendor repository outages</strong> for every version already installed through the broker.</span></li>
              </ul>
              <div className={`pb-actions ${styles.actions}`}>
                <Link className="pb-btn pb-btn--primary pb-btn--lg" to="#quickstart">Start the quickstart</Link>
                <a className="pb-btn pb-btn--lg" href={`${repository}/releases`}>Watch releases</a>
              </div>
              <p className={`pb-legend ${styles.legend}`}>{releaseStatus}. {marketplaceStatus} <Link className="pb-link" to="/compare/private-packagist">Compare with Private Packagist</Link></p>
            </section>
            <HeroAuthJson/>
          </div></div>

          <Section id="before-after" title="What changes for your team">
            <KeysMap/>
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
            <div className={styles.seats}><NoSeatsIcon size="lg"/><p>The software does not count or cap users. Add juniors, freelancers, QA and CI pipelines without a new licence line. No licence fee: you pay for your own hosting, from USD 5 a month on Cloudflare Workers Paid plus usage, or your own Node host.</p></div>
          </Section>

          <Section id="what-you-run" title="What you run" description="You operate the broker. These are the requirements and responsibilities for each runtime.">
            <Operations/>
          </Section>

          <Section id="status" title="Status and maintainer">
            <p>{releaseStatus}. {marketplaceStatus} Maintained by <a className="pb-link" href="https://github.com/lbajsarowicz">lbajsarowicz</a>, AGPL-3.0-only. If the project stops, your deployment keeps running: the code is AGPL and your data stays in your own D1 and R2, or SQLite and your blob store.</p>
            <p>To evaluate alone you do not need an identity provider: setup creates a local administrator protected by a password and an authenticator app.</p>
            <p><a className="pb-link" href={`${repository}/releases`}>Watch the repository</a> for the first release.</p>
          </Section>

          <div className="pb-wrap"><div className="pb-section"><Quickstart/></div></div>
        </main>
        <LandingFooter/>
      </div>
    </Layout>
  );
}
