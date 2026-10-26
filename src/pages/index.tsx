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
  for (const id of ['hero', 'quickstart', 'steps', 'how-it-works', 'identity', 'claims', 'what-you-run', 'compare', 'trust', 'footer']) collectAnchor(id);
  return (
    <Layout title="Private Composer and npm registry" description="Self-hosted Composer and npm registry for PHP and Magento teams: one project per client, identity provider groups, one token policy. No licence fee." noFooter>
      <div className="pb-site">
        <main id="main" tabIndex={-1}>
          <div className="pb-wrap"><div className="pb-section pb-section--first pb-hero-grid">
            <section className="pb-hero" id="hero" aria-labelledby="hero-title">
              <p className="pb-eyebrow">Package Broker 2.0</p>
              <h1 id="hero-title">A private Composer and npm registry where each client’s packages stay with that client.</h1>
              <p className="pb-hero__sub">For PHP and Magento agencies and teams: give each client its own project, sources and credentials, with one token policy for Composer and npm. Self-host on Cloudflare Workers or your own Node host.</p>
              <ul className="pb-hero__mechanisms">
                <li><span><strong>Per-project isolation</strong> by SSO group.</span></li>
                <li><span><strong>One token policy</strong> for Composer and npm.</span></li>
                <li><span><strong>No licence fee</strong> and no per-user, per-project or per-client charge. You pay for your own hosting: Cloudflare Workers Paid starts at USD 5 a month.</span></li>
                <li><span><strong>Running client projects?</strong> <Link className="pb-link" to="/agencies">See how per-client isolation works</Link>.</span></li>
              </ul>
            </section>
            <Quickstart/>
          </div></div>
          <Section id="steps" headingId="steps-title" title="Three steps from nothing to a working install">
            <ol className="pb-steps">
              <li><h3>Deploy</h3><p>Set up Cloudflare Workers or build the Node bundle for your host. Setup (<code>pb cloudflare setup</code>, or <code>pb admin bootstrap</code> on Node) creates a local administrator protected by a password and an authenticator app; you do not need an identity provider to try it.</p></li>
              <li><h3>Point Composer and npm at it</h3><p>Create a project and issue a token. Add its registry URL and token to <code>auth.json</code> and <code>.npmrc</code>.</p></li>
              <li><h3>Connect your identity provider for your team</h3><p>Connect an OpenID Connect provider such as Dex and grant its groups access to projects, or sign in through Cloudflare Access and grant access by e-mail address.</p></li>
            </ol>
          </Section>
          <Section id="how-it-works" headingId="how-title" title="How it works" description="One deployment is one organization. Give each client a project and select its sources. Identity provider groups grant project access; Composer and npm authenticate with a token.">
            <HowItWorks/>
          </Section>
          <Section id="identity" headingId="identity-title" title="Your identity provider stays in charge">
            <p>Package Broker does not manage your team’s groups or passwords. Your team signs in with the accounts it already has, through an OpenID Connect provider that sends a groups claim, such as Dex, or through Cloudflare Access. Dex can bring in GitHub organizations and teams, Google, Microsoft and LDAP directories.</p>
            <p>You manage who belongs to which group in your identity provider. In the broker you grant those groups, or individual e-mail addresses, access to projects. Remove someone from a group and they lose that group’s access after the revalidation window: at their next sign-in or when their session expires, and within a day for personal tokens. Service tokens they created for CI stay valid until you revoke them. <Link className="pb-link" to="/docs/decisions/identity-and-sessions">Session and membership revalidation</Link>.</p>
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
              <li><h3>Governance</h3><p>Maintained by lbajsarowicz. <a className="pb-link" href={`${repository}/blob/main/GOVERNANCE.md`}>GOVERNANCE.md</a> describes the path to becoming a reviewer or maintainer.</p></li>
              <li><h3>Licence</h3><p>AGPL-3.0-only. <a className="pb-link" href={`${repository}/blob/main/LICENSE`}>Read the licence</a>.</p></li>
              <li><h3>Release status</h3><p>{releaseStatus}. Commands may change before the first release.</p></li>
            </ul>
            <div className="pb-alert pb-trust__eol" role="note"><Info className="pb-icon" aria-hidden="true"/><p className="pb-alert__body">Package Broker 1.x is no longer maintained. 2.0 has no tagged release yet; <a className="pb-link" href={`${repository}/releases`}>watch the repository</a> for the first release.</p></div>
          </Section>
        </main>
        <LandingFooter/>
      </div>
    </Layout>
  );
}
