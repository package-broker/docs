import Link from '@docusaurus/Link';
import {comparisonRows, comparisons, comparisonsPublished} from '../../data/landing';

export default function Comparison() {
  return (
    <>
      <div className="pb-site-table pb-container">
        <table className="pb-table pb-table--keep pb-table--summary">
          <caption>Package Broker, Satis, Private Packagist and Packeton</caption>
          <thead><tr><th scope="col">Criterion</th><th scope="col" className="pb-col-pb">Package Broker</th>
            {comparisons.map(item => <th key={item.name} scope="col"><a className="pb-link" href={item.source}>{item.name}</a></th>)}
          </tr></thead>
          <tbody>{comparisonRows.map(([criterion, value]) => <tr key={criterion}>
            <th scope="row">{criterion}</th><td className="pb-col-pb">{value}</td>
            {comparisons.map(item => <td key={item.name}>Not verified</td>)}
          </tr>)}</tbody>
        </table>
      </div>
      <p className="pb-table-note">This width shows Package Broker only. Competitor details are awaiting verification.</p>
      <ul className="pb-links-row">{comparisons.map(item => <li key={item.name}>
        {comparisonsPublished ? <Link className="pb-link" to={item.href}>Compare with {item.name}</Link> : <span>Compare with {item.name} — in preparation</span>}
      </li>)}</ul>
      <ul className="pb-links-row">{comparisons.map(item => <li key={item.name}>
        <Link className="pb-link" to={item.migration}>Migrate from {item.name}</Link>
      </li>)}</ul>
    </>
  );
}
