import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {Info} from 'lucide-react';
import Quickstart from '../components/landing/Quickstart';
import HowItWorks from '../components/landing/HowItWorks';
import Operations from '../components/landing/Operations';
import Comparison from '../components/landing/Comparison';
import {LandingFooter} from '../components/landing/SiteChrome';
import {claims, releaseStatus, repository} from '../data/landing';

function Section({id, headingId, title, description, children}: {id: string; headingId: string; title: string; description?: string; children: ReactNode}) {
  return <div className="pb-wrap"><section className="pb-section" id={id} aria-labelledby={headingId}>
    <div className="pb-section__head"><h2 id={headingId}>{title}</h2>{description && <p>{description}</p>}</div>
    {children}
  </section></div>;
}

export default function Home() {
  const {collectAnchor} = useBrokenLinks();
  for (const id of ['hero', 'quickstart', 'steps', 'how-it-works', 'claims', 'what-you-run', 'compare', 'trust', 'footer']) collectAnchor(id);
  return (
    <Layout title="Private Composer and npm registry" description="Self-host private Composer and npm packages with per-project isolation, OIDC groups and one token policy. Deploy on Cloudflare Workers or Node under AGPL-3.0-only." noFooter>
      <div className="pb-site">
        <main id="main" tabIndex={-1}>
          <div className="pb-wrap"><div className="pb-section pb-section--first pb-hero-grid">
            <section className="pb-hero" id="hero" aria-labelledby="hero-title">
              <p className="pb-eyebrow">Package Broker 2.0, pre-release</p>
              <h1 id="hero-title">Private Composer and npm packages, one registry, one project per client.</h1>
              <p className="pb-hero__sub">Give each client its own project and source credentials, with one token policy for Composer and npm. Deploy on Cloudflare Workers or your own Node host.</p>
              <ul className="pb-hero__mechanisms">
                <li><span><strong>Per-project isolation</strong> by SSO group.</span></li>
                <li><span><strong>One token policy</strong> for Composer and npm.</span></li>
                <li><span><strong>Self-hosted</strong> on Cloudflare Workers or Node. Container image publishing (GHCR) is planned; build the image from the repository.</span></li>
              </ul>
            </section>
            <Quickstart/>
          </div></div>
          <Section id="steps" headingId="steps-title" title="Three steps from nothing to a working install">
            <ol className="pb-steps">
              <li><h3>Deploy</h3><p>Set up Cloudflare Workers or build the Node bundle for your host.</p></li>
              <li><h3>Connect your identity provider</h3><p>Connect Dex or Cloudflare Access with OIDC and map groups to project grants.</p></li>
              <li><h3>Point Composer and npm at it</h3><p>Create a project and issue a token. Add its registry URL and token to <code>auth.json</code> and <code>.npmrc</code>.</p></li>
            </ol>
          </Section>
          <Section id="how-it-works" headingId="how-title" title="How it works" description="One deployment is one organization. Give each client a project and select its sources. Identity provider groups grant project access; Composer and npm authenticate with a token.">
            <HowItWorks/>
          </Section>
          <Section id="claims" headingId="claims-title" title="What it does, and where it is documented">
            <ol className="pb-claims">{claims.map(claim => <li key={claim.title}><article className="pb-claim">
              <h3>{claim.title}</h3><p>{claim.mechanism}</p><p className="pb-claim__prevents"><strong>Prevents:</strong> {claim.prevents}</p>
              <Link className="pb-link" to={claim.href}>{claim.label}</Link>
            </article></li>)}</ol>
          </Section>
          <Section id="what-you-run" headingId="run-title" title="What you run and what you get" description="You operate the broker. These are the requirements and responsibilities for each runtime."><Operations/></Section>
          <Section id="compare" headingId="cmp-title" title="Compared with Satis, Private Packagist and Packeton" description="Compare authentication, isolation, npm, SSO, hosting, licence and price model. Sources and checked dates accompany verified cells; other cells say Not verified."><Comparison/></Section>
          <Section id="trust" headingId="trust-title" title="Project status and policies">
            <ul className="pb-trust">
              <li><h3>Security policy</h3><p><a className="pb-link" href={`${repository}/blob/main/SECURITY.md`}>SECURITY.md</a> explains how to report a vulnerability.</p></li>
              <li><h3>Governance</h3><p><a className="pb-link" href={`${repository}/blob/main/GOVERNANCE.md`}>GOVERNANCE.md</a> names the maintainer and the path to becoming a reviewer or maintainer.</p></li>
              <li><h3>Licence</h3><p>AGPL-3.0-only. <a className="pb-link" href={`${repository}/blob/main/LICENSE`}>Read the licence</a>.</p></li>
              <li><h3>Release status</h3><p>{releaseStatus}. Commands may change before a release candidate.</p></li>
            </ul>
            <div className="pb-alert pb-trust__eol" role="note"><Info className="pb-icon" aria-hidden="true"/><p className="pb-alert__body">Package Broker 1.x is no longer maintained. Deploy 2.0.</p></div>
          </Section>
        </main>
        <LandingFooter/>
      </div>
    </Layout>
  );
}
