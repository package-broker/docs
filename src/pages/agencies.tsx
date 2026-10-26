import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import MarketingLayout, {PageSection} from '../components/marketing/MarketingLayout';
import IsolationDiagram from '../components/agencies/IsolationDiagram';
import {sourceDecision, identityDecision, tokenDecision} from '../data/agencies';
import {workersQuickstart, repository, releaseStatus} from '../data/landing';
import contacts from '../data/contacts.json';
import styles from './agencies.module.css';

export default function Agencies() {
  const {collectAnchor} = useBrokenLinks();
  collectAnchor('mechanisms');
  return <MarketingLayout title="For agencies: one project per client" description="Give each client a project, its own repo.magento.com source credentials and project-bound CI tokens. See how grants control who can install.">
    <div className={styles.page}>
    <div className={`pb-hero pb-hero--page pb-hero-grid ${styles.hero}`}>
      <div className={styles.heroCopy}>
        <p className="pb-eyebrow">For Magento and PHP agencies</p>
        <h1>Keep every client’s keys off your developers’ laptops</h1>
        <p className="pb-hero__sub">Give each developer one personal token for their projects. Store each client’s vendor keys in that client’s project in the broker; give CI a read-only service token for that project.</p>
        <div className="pb-actions"><Link className="pb-btn pb-btn--primary" to={workersQuickstart}>Start the quickstart</Link><Link className="pb-btn" to="#mechanisms">See client access boundaries</Link></div>
        <p className="pb-legend">{releaseStatus}. Marketplace sources: built, in final verification.</p>
      </div>
      <figure className={styles.tokenMap}>
        <p className="pb-eyebrow">Illustration · developer access</p>
        <p><strong>One personal token</strong><br/>Opens only the projects your grants allow</p>
        <ul className={styles.projects}><li>Client A project · granted</li><li>Client B project · granted</li><li>Client C project · no grant, no access</li></ul>
        <figcaption>Client vendor keys stay in the broker. Developers install with broker tokens.</figcaption>
      </figure>
    </div>
    <PageSection id="before-after" title="Rotate one client’s keys without changing everyone’s builds">
      <p>When several clients’ builds share vendor credentials, a purchased extension can reach any build using those credentials. Replacing a shared key means updating every build that uses it.</p>
      <div className="pb-contrast">
        <div className="pb-contrast__panel"><h3>Shared vendor credentials</h3><ul><li>Client keys are copied onto laptops and into CI.</li><li>One shared source makes its packages available to every build using it.</li><li>Replacing that key affects all those builds.</li></ul></div>
        <div className="pb-contrast__panel pb-contrast__panel--with"><h3>One project per client</h3><ul><li>Each project owns its purchased package sources and encrypted keys.</li><li>Developers and CI receive broker tokens, never vendor keys.</li><li>Replace a client’s source key in the broker; other clients’ sources stay separate.</li></ul></div>
      </div>
      <p>Organization-owned sources can supply shared packages. Keep purchased extensions project-owned when you need a client boundary. <Link className="pb-link" to={sourceDecision}>Source ownership and project precedence</Link>.</p>
    </PageSection>
    <PageSection id="mechanisms" title="Three clients, separate sources and install access">
      <p>This fictional example uses one organization with three client projects. Each group has access only to its own project; no organization-wide grants or shared purchased package sources apply.</p>
      <ol className="pb-steps">
        <li><h3>Store the client’s keys</h3><p>Create a project-owned source for the client’s vendor repository. Its credentials are encrypted at rest; organization admins and anyone with both the database and master key can decrypt them.</p></li>
        <li><h3>Grant the project</h3><p>Map a group from an OIDC identity provider such as Dex, or grant an individual e-mail address. Identity and group membership stay in your identity provider.</p></li>
        <li><h3>Install with broker tokens</h3><p>A developer’s personal token covers their allowed projects. CI uses a read-only service token bound to one project. The same token works for Composer and npm.</p></li>
      </ol>
      <IsolationDiagram/>
      <p>Each group can install only from its project in this example. Organization roles can allow broader access. <Link className="pb-link" to={identityDecision}>Organization and project grants</Link>.</p>
    </PageSection>
    <PageSection id="details" title="When the team or a vendor repository changes">
      <ul>
        <li><strong>A freelancer joins one client.</strong> Grant only that project, with no organization role. Use an install-only role if they do not need to publish. Their e-mail domain must be accepted by your identity provider configuration; otherwise use an identity in your agency’s provider.</li>
        <li><strong>A developer leaves.</strong> After moving existing keys into the broker, rotate the old copies once. Suspending the user in the broker takes effect on their next request. Group removal takes up to 12 hours for sessions and 24 hours for personal tokens; e-mail grants and CI tokens need separate removal or revocation. Personal tokens require a broker sign-in at least daily.</li>
        <li><strong>A vendor repository is down.</strong> Archives already installed through the broker are served from its storage. Versions never downloaded through the broker still need the vendor repository. Optional retention rules can remove unused public proxy archives.</li>
      </ul>
      <p>Composer uses one credential for the broker host; npm needs a configuration line per project. <Link className="pb-link" to={tokenDecision}>Personal and service token policy</Link>.</p>
    </PageSection>
    <PageSection id="cost" title="Add people without counting seats">
      <p>The software does not count or cap users. No licence fee or per-user, per-project or per-client charge: you pay for hosting and operations, from USD 5 a month on Workers Paid plus usage, or your own Node host. You operate backups, upgrades and your identity provider.</p>
      <p>If you would rather pay for a hosted Composer service, consider Private Packagist Cloud. Its price model counts users and suborganizations. <Link className="pb-link" to="/compare/private-packagist">Compare with Private Packagist</Link>.</p>
      <p>Package Broker is AGPL-3.0-only. Review the <Link className="pb-link" to="/docs/decisions/licensing-and-contribution-terms">licensing and contribution terms</Link> before choosing it for your agency.</p>
    </PageSection>
    <PageSection id="start" title="Try one client project before switching the agency">
      <div className="pb-cta-band">
        <p>Evaluate alone with a local administrator and a token; no identity provider is needed for that first trial. Connect your identity provider for the team, then check one project’s source selection and install access before moving more clients.</p>
        <p>Migration guides are being written. Ask about your current setup before switching.</p>
        <div className="pb-actions"><Link className="pb-btn pb-btn--primary" to={workersQuickstart}>Start the quickstart</Link><a className="pb-btn" href={`mailto:${contacts.support}`}>Ask about your setup</a><a className="pb-link" href={`${repository}/releases`}>Watch releases on GitHub</a></div>
      </div>
    </PageSection>
    </div>
  </MarketingLayout>;
}
