import {agency} from '../../data/agencies';

export default function IsolationDiagram() {
  return <figure className="pb-diagram pb-diagram--isolation">
    <p className="pb-legend">Identity provider · OIDC groups · <code>{agency.organization}</code></p>
    <div className="pb-diagram__clients">{agency.clients.map(row => <svg key={row.project} width="280" height="370" viewBox="0 0 280 370" role="img" aria-labelledby={`isolation-${row.project}-title isolation-${row.project}-description`}>
      <title id={`isolation-${row.project}-title`}>{`${row.client}: project ${row.project}, credential set ${row.credential}`}</title>
      <desc id={`isolation-${row.project}-description`}>{`${row.group} has a grant to project ${row.project}, which owns source ${row.source} and credential set ${row.credential}. The source connects to ${agency.sourceHost}. No project connects to another project’s credentials.`}</desc>
      <defs><marker id={`isolation-${row.project}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path className="pb-dg-arrow" d="M0 0 10 5 0 10z"/></marker></defs>
      <text className="pb-dg-mono" x="140" y="24" textAnchor="middle">{row.group}</text>
      <path className="pb-dg-edge" d="M140 34V64" markerEnd={`url(#isolation-${row.project}-arrow)`}/>
      <rect className="pb-dg-node" x="10" y="68" width="260" height="64" rx="8"/>
      <text className="pb-dg-text" x="140" y="94" textAnchor="middle">Project</text>
      <text className="pb-dg-mono" x="140" y="120" textAnchor="middle">{row.project}</text>
      <path className="pb-dg-edge" d="M140 132V166" markerEnd={`url(#isolation-${row.project}-arrow)`}/>
      <rect className="pb-dg-node pb-dg-node--token" x="10" y="170" width="260" height="72" rx="8"/>
      <text className="pb-dg-mono" x="140" y="198" textAnchor="middle">{row.source}</text>
      <text className="pb-dg-text" x="140" y="226" textAnchor="middle">Credential set {row.credential}</text>
      <path className="pb-dg-edge" d="M140 242V276" markerEnd={`url(#isolation-${row.project}-arrow)`}/>
      <rect className="pb-dg-node" x="10" y="280" width="260" height="72" rx="8"/>
      <text className="pb-dg-text" x="140" y="308" textAnchor="middle">Source</text>
      <text className="pb-dg-mono" x="140" y="336" textAnchor="middle">{agency.sourceHost}</text>
    </svg>)}</div>
    <figcaption>Each group has a grant to its client’s project. Each project owns its source and credential set. Organization-wide access is excluded from this example.</figcaption>
  </figure>;
}
