import Link from '@docusaurus/Link';
import {comparisonsPublished} from '../../data/landing';
import {comparisonRows, comparisons} from '../../data/comparison';

export default function Comparison() {
  return (
    <>
      <div className="pb-site-table pb-container">
        <table className="pb-table pb-table--keep pb-table--summary">
          <caption>Package Broker, Satis, Private Packagist and Packeton. Competitor documentation checked 2026-10-17; Package Broker source checked 2026-10-25.</caption>
          <thead><tr><th scope="col">Criterion</th><th scope="col" className="pb-col-pb">Package Broker</th>
            {comparisons.map(item => <th key={item.name} scope="col"><a className="pb-link" href={item.source}>{item.name}</a></th>)}
          </tr></thead>
          <tbody>{comparisonRows.map(({criterion, cells}) => <tr key={criterion}>
            <th scope="row">{criterion}</th>
            {cells.map((cell, index) => <td key={index} className={index === 0 ? 'pb-col-pb' : undefined}>
              {cell.sourceUrl ? <a className="pb-link" href={cell.sourceUrl} title={`Checked ${cell.lastVerified}`}>{cell.value}</a> : cell.value}
            </td>)}
          </tr>)}</tbody>
        </table>
        <p className="pb-table-note">This width shows Package Broker only. At wider widths, the table also shows Satis, Private Packagist and Packeton.</p>
      </div>
      <ul className="pb-links-row">{comparisons.map(item => <li key={item.name}>
        {comparisonsPublished ? <Link className="pb-link" to={item.href}>Compare with {item.name}</Link> : <span>Compare with {item.name} — in preparation</span>}
      </li>)}</ul>
      <ul className="pb-links-row">{comparisons.map(item => <li key={item.name}>
        <Link className="pb-link" to={item.migration}>Migrate from {item.name}</Link>
      </li>)}</ul>
    </>
  );
}
