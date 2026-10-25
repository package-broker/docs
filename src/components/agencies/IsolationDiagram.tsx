import {agency} from '../../data/agencies';

export default function IsolationDiagram() {
  const description = agency.clients.map(row =>
    `${row.group} has a grant to project ${row.project}, which owns source ${row.source} and credential set ${row.credential}.`,
  ).join(' ');
  return <figure className="pb-diagram pb-diagram--isolation">
    <svg viewBox={`0 0 360 ${110 + agency.clients.length * 170}`} role="img" aria-labelledby="isolation-title isolation-description">
      <title id="isolation-title">One organization, three projects, three credential sets</title>
      <desc id="isolation-description">{description} Each source connects to {agency.sourceHost}. No project connects to another project’s credentials.</desc>
      <defs><marker id="isolation-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path className="pb-dg-arrow" d="M0 0 10 5 0 10z"/></marker></defs>
      <rect className="pb-dg-node pb-dg-node--token" x="10" y="10" width="340" height="64" rx="8"/>
      <text className="pb-dg-text" x="180" y="36" textAnchor="middle">Identity provider · OIDC groups</text>
      <text className="pb-dg-mono" x="180" y="60" textAnchor="middle">{agency.organization}</text>
      <path className="pb-dg-edge" d={`M350 42H358V${100 + (agency.clients.length - 1) * 170}`}/>
      {agency.clients.map((row, index) => {
        const y = 106 + index * 170;
        return <g key={row.project}>
          <path className="pb-dg-edge" d={`M358 ${y - 6}H140`} markerEnd="url(#isolation-arrow)"/>
          <text className="pb-dg-mono" x="10" y={y}>{row.group}</text>
          <path className="pb-dg-edge" d={`M66 ${y + 6}V${y + 27}`} markerEnd="url(#isolation-arrow)"/>
          <rect className="pb-dg-node" x="10" y={y + 30} width="120" height="56" rx="8"/>
          <text className="pb-dg-text" x="70" y={y + 51} textAnchor="middle">Project</text>
          <text className="pb-dg-mono" x="70" y={y + 74} textAnchor="middle">{row.project}</text>
          <path className="pb-dg-edge" d={`M130 ${y + 58}H172`} markerEnd="url(#isolation-arrow)"/>
          <rect className="pb-dg-node pb-dg-node--token" x="176" y={y + 30} width="174" height="80" rx="8"/>
          <text className="pb-dg-mono" x="263" y={y + 53} textAnchor="middle">{row.source}</text>
          <text className="pb-dg-text" x="263" y={y + 76} textAnchor="middle">Credential set {row.credential}</text>
          <text className="pb-dg-text" x="263" y={y + 98} textAnchor="middle">{agency.sourceHost}</text>
          <text className="pb-dg-text" x="10" y={y + 140}>{row.client} · project-owned source</text>
        </g>;
      })}
    </svg>
    <figcaption>Each group has a grant to its client’s project. Each project owns its source and credential set. Organization-wide access is excluded from this example.</figcaption>
  </figure>;
}
