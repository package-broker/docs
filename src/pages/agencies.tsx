import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import MarketingLayout, {PageSection} from '../components/marketing/MarketingLayout';
import IsolationDiagram from '../components/agencies/IsolationDiagram';
import {sourceDecision, identityDecision, tokenDecision} from '../data/agencies';
import {workersQuickstart, repository, releaseStatus} from '../data/landing';
import contacts from '../data/contacts.json';
import {releasesFeed} from '../data/entity';
import styles from './agencies.module.css';

export default function Agencies() {
  const {collectAnchor} = useBrokenLinks();
  collectAnchor('mechanisms');
  collectAnchor('cost');
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
        <li><h3>Store the client’s keys</h3><p>Create a project-owned source for the client’s vendor repository. Its credentials are encrypted at rest; organization admins and anyone with both the database and master key can decrypt them. <Link className="pb-link" to="/docs/guides/mirror-vendor-repositories">Set up vendor repositories and credentials</Link>.</p></li>
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
        <li><strong>A vendor repository is down.</strong> Archives already installed through the broker are served from its storage. Versions never downloaded through the broker still need the vendor repository. Lifecycle expiry is optional and applies only to public proxy packages, never to vendor-repository archives.</li>
      </ul>
      <p>Composer uses one credential for the broker host; npm needs a configuration line per project. <Link className="pb-link" to={tokenDecision}>Personal and service token policy</Link>.</p>
    </PageSection>
    <PageSection id="cost" title="Add people without counting seats">
      <p>The software does not count or cap users. No licence fee or per-user, per-project or per-client charge: you pay for hosting and operations, from USD 5 a month on Workers Paid plus usage, or your own Node host. You operate backups, upgrades and your identity provider. <Link className="pb-link" to="/pricing">Hosting costs and operating responsibilities</Link>.</p>
      <p>If you would rather pay for a hosted Composer service, consider Private Packagist Cloud. Its price model counts users and suborganizations. <Link className="pb-link" to="/compare/private-packagist">Compare with Private Packagist</Link>.</p>
      <p>Package Broker is AGPL-3.0-only. Review the <Link className="pb-link" to="/docs/decisions/licensing-and-contribution-terms">licensing and contribution terms</Link> before choosing it for your agency.</p>
    </PageSection>
    <PageSection id="start" title="Try one client project before switching the agency">
      <div className="pb-cta-band">
        <p>Evaluate alone with a local administrator and a token; no identity provider is needed for that first trial. Connect your identity provider for the team, then check one project’s source selection and install access before moving more clients.</p>
        <p>Migration guides cover <Link className="pb-link" to="/docs/migration/from-private-packagist">Private Packagist</Link>, <Link className="pb-link" to="/docs/migration/from-satis">Satis</Link> and <Link className="pb-link" to="/docs/migration/from-packeton">Packeton</Link>. Compare with <Link className="pb-link" to="/compare/satis">Satis</Link> or <Link className="pb-link" to="/compare/packeton">Packeton</Link> before switching.</p>
        <div className="pb-actions"><Link className="pb-btn pb-btn--primary" to={workersQuickstart}>Start the quickstart</Link><a className="pb-btn" href={`mailto:${contacts.support}`}>Ask about your setup</a></div>
        <p>Get notified of releases: open <a className="pb-link" href={repository}>the GitHub repository</a> and choose Watch → Custom → Releases, or subscribe to the <a className="pb-link" href={releasesFeed}>release Atom feed</a>.</p>
        <p>Getting help: report bugs in <a className="pb-link" href={`${repository}/issues`}>GitHub issues</a>, ask questions in <a className="pb-link" href={`${repository}/discussions`}>GitHub Discussions</a>, or e-mail <a className="pb-link" href={`mailto:${contacts.support}`}>{contacts.support}</a> for private setup questions. Use the <Link className="pb-link" to="/security#disclosure">private vulnerability reporting routes</Link> for security problems.</p>
      </div>
    </PageSection>
    <PageSection id="faq" title="Questions before moving a client">
      <div className="pb-faq">
        <details><summary>What happens if a vendor repository is down?</summary><div className="pb-faq__answer"><p>Archives already installed through the broker are served from its storage. Versions never downloaded through the broker still need the vendor repository. Lifecycle expiry is optional and applies only to public proxy packages, never to vendor-repository archives.</p></div></details>
        <details><summary>Who can decrypt a client’s keys?</summary><div className="pb-faq__answer"><p>Organization admins and anyone with both the database and deployment master key can decrypt source credentials. Developers and CI install with broker tokens. You own master key storage, access, backup and rotation. <Link className="pb-link" to={tokenDecision}>Secrets and token policy</Link>.</p></div></details>
        <details><summary>Can the data stay in the EU?</summary><div className="pb-faq__answer"><p>For Workers deployments that need EU storage, choose the <code>eu</code> jurisdiction when creating D1 and R2 resources. Provisioning checks the requested jurisdiction against existing resources. On Node, you choose the host and persistent storage. Storage placement does not determine where requests to package sources or external services are processed. <Link className="pb-link" to="/security#residency">Data location and outbound requests</Link>.</p></div></details>
        <details><summary>What do you operate yourself?</summary><div className="pb-faq__answer"><p>You run backups, restore checks, upgrades, master key recovery and your identity provider. You also manage storage placement, token policies and network exposure; on Node you operate the host and volumes. <Link className="pb-link" to="/security#operator">Operator responsibilities</Link> · <Link className="pb-link" to="/pricing">Hosting and operations costs</Link>.</p></div></details>
        <details><summary>How do you move one client first?</summary><div className="pb-faq__answer"><p>Evaluate one client project before moving more clients. Create its project-owned sources, connect your identity provider for the team, and check source selection and install access. Follow the migration guide for <Link className="pb-link" to="/docs/migration/from-private-packagist">Private Packagist</Link>, <Link className="pb-link" to="/docs/migration/from-satis">Satis</Link> or <Link className="pb-link" to="/docs/migration/from-packeton">Packeton</Link>.</p></div></details>
        <details><summary>What happens if the project stops?</summary><div className="pb-faq__answer"><p>The code is AGPL-3.0-only, and your data stays in your own D1 and R2, or SQLite and your blob store. You remain responsible for backups and updates. <Link className="pb-link" to="/docs/decisions/licensing-and-contribution-terms">Licensing and contribution terms</Link> · <Link className="pb-link" to="/docs/decisions/deployment-and-runtimes">Deployment and recovery decisions</Link>.</p></div></details>
      </div>
    </PageSection>
    </div>
  </MarketingLayout>;
}
