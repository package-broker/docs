import Link from '@docusaurus/Link';
import MarketingLayout, {PageSection} from '../components/marketing/MarketingLayout';
import {operatorResponsibilities, privateReportingUrl, productFile, publishedClaim, securityPolicyUrl, tokenKinds} from '../data/security-claims';
import contacts from '../data/contacts.json';
import {repository, workersQuickstart} from '../data/landing';

function Claim({id, className}: {id: string; className?: string}) {
  const claim = publishedClaim(id);
  return <p className={className}>{claim.text.split(/(`[^`]+`)/g).map((part, index) => part.startsWith('`') ? <code key={index}>{part.slice(1, -1)}</code> : part)}</p>;
}

export default function Security() {
  return <MarketingLayout title="Security at Package Broker" description={publishedClaim('overview').text}>
    <div className="pb-hero pb-hero--page"><p className="pb-eyebrow">Security</p><h1>Security at Package Broker</h1><Claim id="overview" className="pb-hero__sub"/><Claim id="release-status" className="pb-page-meta"/></div>
    <PageSection id="disclosure" title="Reporting a vulnerability">
      <Claim id="reporting"/>
      <p><a className="pb-link" href={privateReportingUrl}>GitHub private vulnerability reporting</a> · <a className="pb-link" href={`mailto:${contacts.security}`}>{contacts.security}</a></p>
      <Claim id="report-email"/>
      <Claim id="report-details"/><Claim id="report-scope"/>
      <p><a className="pb-link" href={securityPolicyUrl}>Security policy (SECURITY.md)</a> · <a className="pb-link" href="/.well-known/security.txt">Machine-readable disclosure policy</a></p>
    </PageSection>
    <PageSection id="tokens" title="Token model">
      <Claim id="token-scopes"/>
      <div className="pb-site-table pb-container"><table className="pb-table" role="table"><caption>Shipped token kinds, project binding and expiry policy</caption>
        <thead role="rowgroup"><tr role="row">{['Kind', 'Principal', 'Project binding', 'Maximum life'].map((label, index) => <th id={`token-col-${index}`} key={label} scope="col" role="columnheader">{label}</th>)}</tr></thead>
        <tbody role="rowgroup">{tokenKinds.map(item => { const row = publishedClaim(item); return <tr role="row" key={row.prefix}><th id={`token-${row.id}`} headers="token-col-0" scope="row" role="rowheader"><span className="pb-table__cell-label" aria-hidden="true">Kind</span><span className="pb-table__value"><code>{row.prefix}</code></span></th><td headers={`token-${row.id} token-col-1`} role="cell"><span className="pb-table__cell-label" aria-hidden="true">Principal</span><span className="pb-table__value">{row.principal}</span></td><td headers={`token-${row.id} token-col-2`} role="cell"><span className="pb-table__cell-label" aria-hidden="true">Project binding</span><span className="pb-table__value">{row.binding}</span></td><td headers={`token-${row.id} token-col-3`} role="cell"><span className="pb-table__cell-label" aria-hidden="true">Maximum life</span><span className="pb-table__value">{row.lifetime}</span></td></tr>; })}</tbody>
      </table></div>
      <Claim id="scope-usage"/>
      <Claim id="token-creation"/><Claim id="token-expiry"/>
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
      <Claim id="operator-intro"/>
      <div className="pb-site-table pb-container"><table className="pb-table" role="table"><caption>Software mechanisms and operator responsibilities</caption><thead role="rowgroup"><tr role="row"><th id="operator-col-0" scope="col" role="columnheader">Area</th><th id="operator-col-1" scope="col" role="columnheader">Package Broker provides</th><th id="operator-col-2" scope="col" role="columnheader">The operator owns</th></tr></thead><tbody role="rowgroup">{operatorResponsibilities.map(item => { const row = publishedClaim(item); return <tr role="row" key={row.area}><th id={row.id} headers="operator-col-0" scope="row" role="rowheader"><span className="pb-table__cell-label" aria-hidden="true">Area</span><span className="pb-table__value">{row.area}</span></th><td headers={`${row.id} operator-col-1`} role="cell"><span className="pb-table__cell-label" aria-hidden="true">Package Broker provides</span><span className="pb-table__value">{row.provided}</span></td><td headers={`${row.id} operator-col-2`} role="cell"><span className="pb-table__cell-label" aria-hidden="true">The operator owns</span><span className="pb-table__value">{row.operator}</span></td></tr>; })}</tbody></table></div>
      <p><Link className="pb-link" to="/docs/decisions/deployment-and-runtimes">Deployment and recovery decisions</Link></p>
    </PageSection>
    <PageSection id="maintainers" title="Support and maintainers">
      <Claim id="maintainer"/>
      <Claim id="support"/><p><a className="pb-link" href={`${repository}/discussions`}>GitHub Discussions</a> · <a className="pb-link" href={`mailto:${contacts.support}`}>{contacts.support}</a></p>
      <p><a className="pb-link" href={productFile('GOVERNANCE.md')}>Governance (GOVERNANCE.md)</a></p>
    </PageSection>
    <PageSection id="status" title="Release status">
      <Claim id="release"/>
      <div className="pb-actions"><Link className="pb-btn pb-btn--primary" to={workersQuickstart}>Deployment quickstart</Link><a className="pb-btn" href={securityPolicyUrl}>Security policy</a></div>
    </PageSection>
  </MarketingLayout>;
}
