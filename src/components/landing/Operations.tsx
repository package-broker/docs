import type {ReactNode} from 'react';
import {repository} from '../../data/landing';

const rows: {label: string; workers: ReactNode; docker: ReactNode}[] = [
  {label: 'Prerequisites', workers: 'Workers Paid plan, Node 24 and pnpm.', docker: 'Docker, Node 24 and pnpm to build; a host with persistent storage. Container image publishing (GHCR) is planned; build the image from the repository.'},
  {label: 'Resources you run', workers: 'Workers, D1, R2, Queues and Cron Triggers.', docker: 'The Node bundle, SQLite and a filesystem blob store, or an S3-compatible bucket.'},
  {label: 'You own', workers: 'Backups, master key recovery, upgrades and the identity provider.', docker: 'Backups, master key recovery, upgrades, the host and the identity provider.'},
  {label: 'Cost floor', workers: <>From USD 5 per month (Workers Paid account minimum) plus usage beyond the included requests and CPU time; D1, R2 and Queues are billed by usage. <a className="pb-link" href="https://developers.cloudflare.com/workers/platform/pricing/">Workers pricing</a> (checked 2026-10-25).</>, docker: 'Your host, storage and operations.'},
  {label: 'Support', workers: <>Community issues and Discussions; one maintainer during pre-release. <a className="pb-link" href={`${repository}/blob/main/GOVERNANCE.md`}>Governance</a>.</>, docker: <>Community issues and Discussions; one maintainer during pre-release. <a className="pb-link" href={`${repository}/blob/main/GOVERNANCE.md`}>Governance</a>.</>},
  {label: 'Licence', workers: 'AGPL-3.0-only.', docker: 'AGPL-3.0-only.'},
];

export default function Operations() {
  return (
    <div className="pb-site-table pb-container">
      <table className="pb-table" role="table">
        <caption>Workers and Docker deployment requirements and operator responsibilities</caption>
        <thead role="rowgroup"><tr role="row"><th id="runtime-item" scope="col" role="columnheader">Item</th><th id="runtime-workers" scope="col" role="columnheader">Cloudflare Workers</th><th id="runtime-node" scope="col" role="columnheader">Docker / Node</th></tr></thead>
        <tbody role="rowgroup">{rows.map((row, index) => <tr role="row" key={row.label}>
          <th id={`runtime-row-${index}`} headers="runtime-item" scope="row" role="rowheader">{row.label}</th>
          <td headers={`runtime-row-${index} runtime-workers`} role="cell"><span className="pb-table__cell-label" aria-hidden="true">Cloudflare Workers</span><span className="pb-table__value">{row.workers}</span></td>
          <td headers={`runtime-row-${index} runtime-node`} role="cell"><span className="pb-table__cell-label" aria-hidden="true">Docker / Node</span><span className="pb-table__value">{row.docker}</span></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}
