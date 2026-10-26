import Link from '@docusaurus/Link';
import MarketingLayout, {PageSection} from '../components/marketing/MarketingLayout';
import IsolationDiagram from '../components/agencies/IsolationDiagram';
import ScenarioTable from '../components/agencies/ScenarioTable';
import {agency, sourceDecision, identityDecision, tokenDecision} from '../data/agencies';
import {workersQuickstart} from '../data/landing';

export default function Agencies() {
  const [first] = agency.clients;
  return <MarketingLayout title="For agencies: one project per client" description="Give each client a project, its own repo.magento.com source credentials and project-bound CI tokens. See how grants control who can install.">
    <div className="pb-hero pb-hero--page">
      <p className="pb-eyebrow">For agencies</p>
      <h1>For agencies: one project per client</h1>
      <p className="pb-hero__sub">Keep purchased extensions in a client’s project with project-owned sources, separate source credentials and a service token bound to that project.</p>
      <div className="pb-actions"><Link className="pb-btn pb-btn--primary" to={workersQuickstart}>Deployment quickstart</Link><Link className="pb-btn" to={identityDecision}>Identity and project grants</Link></div>
    </div>
    <PageSection id="scenario" title="The scenario">
      <p>Your agency buys a Magento extension for each of three clients. A shared credential set can make a purchased package available to every build using that set. Give each client a project and keep its purchased package source inside that project.</p>
      <p>One deployment holds one organization. In this example, <code>{agency.organization}</code> has three projects. Package names, groups and source names below are examples.</p>
      <ul>{agency.clients.map(row => <li key={row.project}>{row.client} installs <code>{row.package}</code> through project <code>{row.project}</code>, source <code>{row.source}</code> and credential set {row.credential}.</li>)}</ul>
      <p><Link className="pb-link" to={sourceDecision}>Source ownership and project precedence</Link> · <Link className="pb-link" to={identityDecision}>Organization and project grants</Link></p>
    </PageSection>
    <PageSection id="mechanisms" title="How the isolation works">
      <div className="pb-split"><ol>
        <li><strong>Grant access to groups or e-mails.</strong> Use OIDC identity provider groups such as <code>{first.group}</code>, or grant an individual e-mail address access to a project. Group membership stays in your identity provider; the broker has no local groups and no passwords for your developers; they sign in through your identity provider. <Link className="pb-link" to={identityDecision}>Identity and grants</Link>.</li>
        <li><strong>Choose source ownership.</strong> Sources and credentials can belong to the organization or a project. Keep client purchases project-owned; organization-owned sources can supply shared packages. <Link className="pb-link" to={sourceDecision}>Source ownership</Link>.</li>
        <li><strong>Use separate source credentials.</strong> {agency.clients.map((row, index) => <span key={row.project}>{index > 0 && '; '}<code>{row.project}</code> owns <code>{row.source}</code> with credential set {row.credential}</span>)}. <Link className="pb-link" to={sourceDecision}>Project sources and credentials</Link>.</li>
        <li><strong>Bind CI tokens to the project.</strong> Issue a service token with <code>read</code> scope for each project. A token bound to one project does not grant access to another. Personal tokens can cover several selected projects. <Link className="pb-link" to={tokenDecision}>Token kinds and project binding</Link>.</li>
      </ol><IsolationDiagram/></div>
    </PageSection>
    <PageSection id="before-after" title="Without and with a project boundary">
      <div className="pb-contrast">
        <div className="pb-contrast__panel"><h3>Without: one shared credential set</h3><ul><li>Every client build uses the same source credentials.</li><li>A purchased extension can reach another client’s build when both use that shared source.</li><li>Replacing shared credentials affects every build that uses them.</li></ul></div>
        <div className="pb-contrast__panel pb-contrast__panel--with"><h3>With: one project per client</h3><ul><li>Each project owns its purchased package source and credentials.</li><li>Each CI service token has <code>read</code> scope and a single project binding.</li><li>Keep grants limited to that project; organization grants can allow broader access.</li></ul></div>
      </div><p><Link className="pb-link" to={sourceDecision}>Source boundaries</Link> · <Link className="pb-link" to={identityDecision}>Grant boundaries</Link> · <Link className="pb-link" to={tokenDecision}>Token boundaries</Link></p>
    </PageSection>
    <PageSection id="magento-keys" title={<><code>{agency.sourceHost}</code> keys per project</>}>
      <p>Configure a separate Composer source for each client’s purchased extensions. The source owns its credential set; the project owns the source. <Link className="pb-link" to={sourceDecision}>Composer sources and ownership</Link>.</p>
      <ol className="pb-steps"><li><h3>Add the source</h3><p>Add <code>{agency.sourceHost}</code> as project <code>{first.project}</code>’s source <code>{first.source}</code>.</p></li><li><h3>Store the key pair</h3><p>{agency.clients.map(row => <span key={row.project}>Use {row.client}’s credential set {row.credential} on <code>{row.source}</code>. </span>)}</p></li><li><h3>Install with a project token</h3><p>Give CI a service token with <code>read</code> scope bound to <code>{first.project}</code>.</p></li></ol>
      <p><Link className="pb-link" to={tokenDecision}>Service token policy</Link></p>
    </PageSection>
    <PageSection id="npm-boundary" title="npm follows the same boundary">
      <p>The npm registry URL is <code>/&lt;project&gt;/npm/</code>. Use that project’s URL in <code>.npmrc</code> and a service token bound to the project. Source precedence and project access apply to both Composer and npm. <Link className="pb-link" to={identityDecision}>Project URLs</Link> · <Link className="pb-link" to={sourceDecision}>Registry resolution</Link>.</p>
    </PageSection>
    <PageSection id="who-sees" title="Who sees what">
      <p>The example grants each group install access only to its project. It uses no organization-wide grants or shared purchased package sources. <Link className="pb-link" to={identityDecision}>Group and e-mail grants</Link>.</p>
      <ScenarioTable/>
      <p>Broker-side grant removal and token revocation apply on the next request. Identity provider group changes have a separate revalidation window; do not treat group removal as immediate revocation. <Link className="pb-link" to={identityDecision}>Session and membership revalidation</Link>.</p>
    </PageSection>
    <PageSection id="ci-tokens" title="CI tokens: read scope, one project">
      <ul className="pb-feature-grid"><li><div className="pb-card"><h3><code>pb_svc_</code> service token</h3><p>Use a service principal bound to one project for CI. Choose <code>read</code> scope for installs; organization-wide service principals require organization administration rights.</p></div></li><li><div className="pb-card"><h3><code>pb_pat_</code> personal token</h3><p>Use a personal token for a developer’s selected projects, or all projects their grants allow. A personal token can cover more than one project.</p></div></li></ul>
      <p>Re-authentication is required to create a token. Expiry follows the configured token lifetime policy. <Link className="pb-link" to={tokenDecision}>Token policy and revocation</Link>.</p>
    </PageSection>
    <PageSection id="start" title="Create the first project">
      <div className="pb-cta-band"><p>Try the deployment on your own first; connect your identity provider when you give the first client its own project.</p><div className="pb-actions"><Link className="pb-btn pb-btn--primary" to={workersQuickstart}>Deployment quickstart</Link><Link className="pb-btn" to={identityDecision}>Identity and project grants</Link></div></div>
    </PageSection>
  </MarketingLayout>;
}
