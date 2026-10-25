import type {ReactNode} from 'react';
import {repository} from '../../data/landing';

const rows: {label: string; workers: ReactNode; docker: ReactNode}[] = [
  {label: 'Prerequisites', workers: 'Workers Paid plan, Node 24 and pnpm.', docker: 'Node 24 and pnpm to build; a host with persistent storage to run the Node bundle. The Docker image is planned.'},
  {label: 'Resources you run', workers: 'Workers, D1, R2, Queues and Cron Triggers.', docker: 'The Node bundle, SQLite and a filesystem blob store, or an S3-compatible bucket.'},
  {label: 'You own', workers: 'Backups, master key recovery, upgrades and the identity provider.', docker: 'Backups, master key recovery, upgrades, the host and the identity provider.'},
  {label: 'Cost floor', workers: <>Workers Paid plan plus storage and usage. Current range not verified. <a className="pb-link" href="https://developers.cloudflare.com/workers/platform/pricing/">Workers pricing</a>.</>, docker: 'Your host, storage and operations. The amount depends on your deployment.'},
  {label: 'Support', workers: <>Community issues and Discussions; one maintainer during pre-release. <a className="pb-link" href={`${repository}/blob/main/GOVERNANCE.md`}>Governance</a>.</>, docker: <>Community issues and Discussions; one maintainer during pre-release. <a className="pb-link" href={`${repository}/blob/main/GOVERNANCE.md`}>Governance</a>.</>},
  {label: 'Licence', workers: 'AGPL-3.0-only.', docker: 'AGPL-3.0-only.'},
];

export default function Operations() {
  return (
    <div className="pb-site-table pb-container">
      <table className="pb-table">
        <caption>Workers and Docker deployment requirements and operator responsibilities</caption>
        <thead><tr><th scope="col">Item</th><th scope="col">Cloudflare Workers</th><th scope="col">Docker / Node</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.label}>
          <th scope="row">{row.label}</th>
          <td><span className="pb-table__cell-label" aria-hidden="true">Cloudflare Workers</span><span className="pb-table__value">{row.workers}</span></td>
          <td><span className="pb-table__cell-label" aria-hidden="true">Docker / Node</span><span className="pb-table__value">{row.docker}</span></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}
