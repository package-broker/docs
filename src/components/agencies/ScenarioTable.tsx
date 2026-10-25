import {agency} from '../../data/agencies';

export default function ScenarioTable() {
  return <div className="pb-site-table pb-container">
    <table className="pb-table" role="table">
      <caption>Example clients, project-owned sources and install access</caption>
      <thead role="rowgroup"><tr role="row">{['Client', 'Project', 'Source', 'Credential', 'Who can install'].map(label => <th key={label} scope="col" role="columnheader">{label}</th>)}</tr></thead>
      <tbody role="rowgroup">{agency.clients.map(row => <tr role="row" key={row.project}>
        <th scope="row" role="rowheader"><span className="pb-table__cell-label" aria-hidden="true">Client</span>{row.client}</th>
        <td role="cell"><span className="pb-table__cell-label" aria-hidden="true">Project</span><code>{row.project}</code></td>
        <td role="cell"><span className="pb-table__cell-label" aria-hidden="true">Source</span><span><code>{row.source}</code><br/><code>{agency.sourceHost}</code></span></td>
        <td role="cell"><span className="pb-table__cell-label" aria-hidden="true">Credential</span>Set {row.credential}</td>
        <td role="cell"><span className="pb-table__cell-label" aria-hidden="true">Who can install</span><span><code>{row.group}</code> with an install grant; a service token with <code>read</code> scope bound to <code>{row.project}</code></span></td>
      </tr>)}</tbody>
    </table>
  </div>;
}
