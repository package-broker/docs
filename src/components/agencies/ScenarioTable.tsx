import {agency, scenarioColumns} from '../../data/agencies';

export default function ScenarioTable() {
  return <div className="pb-site-table pb-container">
    <table className="pb-table" role="table">
      <caption>Example clients, project-owned sources and install access</caption>
      <thead role="rowgroup"><tr role="row">{scenarioColumns.map((label, index) => <th id={`scenario-col-${index}`} key={label} scope="col" role="columnheader">{label}</th>)}</tr></thead>
      <tbody role="rowgroup">{agency.clients.map(row => <tr role="row" key={row.project}>
        <th id={`scenario-${row.project}`} headers="scenario-col-0" scope="row" role="rowheader"><span className="pb-table__cell-label" aria-hidden="true">Client</span><span className="pb-table__value">{row.client}</span></th>
        <td headers={`scenario-${row.project} scenario-col-1`} role="cell"><span className="pb-table__cell-label" aria-hidden="true">Project</span><span className="pb-table__value"><code>{row.project}</code></span></td>
        <td headers={`scenario-${row.project} scenario-col-2`} role="cell"><span className="pb-table__cell-label" aria-hidden="true">Source</span><span className="pb-table__value"><code>{row.source}</code><br/><code>{agency.sourceHost}</code></span></td>
        <td headers={`scenario-${row.project} scenario-col-3`} role="cell"><span className="pb-table__cell-label" aria-hidden="true">Credential</span><span className="pb-table__value">Set {row.credential}</span></td>
        <td headers={`scenario-${row.project} scenario-col-4`} role="cell"><span className="pb-table__cell-label" aria-hidden="true">Who can install</span><span className="pb-table__value"><code>{row.installAccess.group}</code> with {row.installAccess.grant}; a service token with <code>{row.installAccess.tokenScope}</code> scope bound to <code>{row.installAccess.tokenProject}</code></span></td>
      </tr>)}</tbody>
    </table>
  </div>;
}
