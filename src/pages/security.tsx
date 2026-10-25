import Link from '@docusaurus/Link';
import MarketingLayout, {PageSection} from '../components/marketing/MarketingLayout';
import {operatorResponsibilities, privateReportingUrl, productFile, publishedClaim, securityPolicyUrl, tokenKinds} from '../data/security-claims';
import contacts from '../data/contacts.json';
import {repository, workersQuickstart} from '../data/landing';

function Claim({id}: {id: string}) {
  const claim = publishedClaim(id);
  return <p>{claim.text.split(/(`[^`]+`)/g).map((part, index) => part.startsWith('`') ? <code key={index}>{part.slice(1, -1)}</code> : part)}</p>;
}

export default function Security() {
  return <MarketingLayout title="Security at Package Broker" description="Report vulnerabilities, review token scopes and audit records, and understand storage placement and operator responsibilities for a self-hosted registry." showLicense={false}>
    <div className="pb-hero pb-hero--page"><p className="pb-eyebrow">Security</p><h1>Security at Package Broker</h1><p className="pb-hero__sub">Report a vulnerability, review the token model and audit log, and check where your deployment stores data. You operate the registry and choose its deployment controls.</p><p className="pb-page-meta">Release status: pre-release</p></div>
    <PageSection id="disclosure" title="Reporting a vulnerability">
      <Claim id="reporting"/>
      <p><a className="pb-link" href={privateReportingUrl}>GitHub private vulnerability reporting</a> · <a className="pb-link" href={`mailto:${contacts.security}`}>{contacts.security}</a></p>
      <p>You can also report by e-mail. The same address accepts questions about this page.</p>
      <Claim id="report-details"/><Claim id="report-scope"/>
      <p><a className="pb-link" href={securityPolicyUrl}>Read SECURITY.md</a> · <a className="pb-link" href="/.well-known/security.txt">Machine-readable disclosure policy</a></p>
    </PageSection>
    <PageSection id="tokens" title="Token model">
      <Claim id="token-scopes"/>
      <div className="pb-site-table pb-container"><table className="pb-table" role="table"><caption>Shipped token kinds, project binding and expiry policy</caption>
        <thead role="rowgroup"><tr role="row">{['Kind', 'Principal', 'Project binding', 'Maximum life'].map(label => <th key={label} scope="col" role="columnheader">{label}</th>)}</tr></thead>
        <tbody role="rowgroup">{tokenKinds.map(row => <tr role="row" key={row.prefix}><th scope="row" role="rowheader"><span className="pb-table__cell-label" aria-hidden="true">Kind</span><code>{row.prefix}</code></th><td role="cell"><span className="pb-table__cell-label" aria-hidden="true">Principal</span>{row.principal}</td><td role="cell"><span className="pb-table__cell-label" aria-hidden="true">Project binding</span>{row.binding}</td><td role="cell"><span className="pb-table__cell-label" aria-hidden="true">Maximum life</span>{row.lifetime}</td></tr>)}</tbody>
      </table></div>
      <p>Use <code>read</code> scope for installs in CI. Choose <code>write</code> for publishing operations or <code>full</code> for token-eligible API operations only when the principal’s grants allow them. Session-only actions still require a session.</p>
      <Claim id="token-creation"/><Claim id="token-expiry"/>
      <p><Link className="pb-link" to="/docs/decisions/secrets-and-tokens">Token model decision</Link> · <a className="pb-link" href={productFile('packages/core/src/authz/token-lifetime.ts')}>Current token lifetime policy</a></p>
    </PageSection>
    <PageSection id="audit" title="Audit log">
      <Claim id="audit-storage"/><Claim id="audit-limit"/>
      <p><a className="pb-link" href={productFile('packages/core/src/api/routes/audit.ts')}>Audit API implementation</a> · <Link className="pb-link" to="/docs/decisions/identity-and-sessions">Audit log decision</Link></p>
    </PageSection>
    <PageSection id="residency" title="Where data lives">
      <Claim id="workers-storage"/><Claim id="node-storage"/><Claim id="egress"/>
      <p><Link className="pb-link" to="/docs/security-and-residency">Security and data residency</Link> · <a className="pb-link" href={productFile('packages/cli/src/commands/cloudflare/provision.ts')}>Provisioning jurisdiction checks</a></p>
    </PageSection>
    <PageSection id="operator" title="What the operator owns">
      <p>You deploy Package Broker. Use this division of responsibilities when reviewing your deployment.</p>
      <div className="pb-site-table pb-container"><table className="pb-table" role="table"><caption>Software mechanisms and operator responsibilities</caption><thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Area</th><th scope="col" role="columnheader">Package Broker provides</th><th scope="col" role="columnheader">The operator owns</th></tr></thead><tbody role="rowgroup">{operatorResponsibilities.map(row => <tr role="row" key={row.area}><th scope="row" role="rowheader"><span className="pb-table__cell-label" aria-hidden="true">Area</span>{row.area}</th><td role="cell"><span className="pb-table__cell-label" aria-hidden="true">Package Broker provides</span>{row.provided}</td><td role="cell"><span className="pb-table__cell-label" aria-hidden="true">The operator owns</span>{row.operator}</td></tr>)}</tbody></table></div>
      <p><Link className="pb-link" to="/docs/decisions/deployment-and-runtimes">Deployment and recovery decisions</Link></p>
    </PageSection>
    <PageSection id="maintainers" title="Support and maintainers">
      <Claim id="maintainer"/>
      <p>Ask general questions in <a className="pb-link" href={`${repository}/discussions`}>GitHub Discussions</a> or write to <a className="pb-link" href={`mailto:${contacts.support}`}>{contacts.support}</a>. Report security problems through the private disclosure routes above.</p>
      <p><a className="pb-link" href={productFile('GOVERNANCE.md')}>Read GOVERNANCE.md</a></p>
    </PageSection>
    <PageSection id="status" title="Release status">
      <Claim id="release"/>
      <div className="pb-actions"><Link className="pb-btn pb-btn--primary" to={workersQuickstart}>Start with the quickstart</Link><a className="pb-btn" href={securityPolicyUrl}>Read the security policy</a></div>
    </PageSection>
  </MarketingLayout>;
}
