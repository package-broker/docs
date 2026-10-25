import Link from '@docusaurus/Link';
import data from '../../data/comparison.json';

export type ComparisonCell = (typeof data.criteria)[number]['cells'][number] & {planName?: string; priceSourceUrl?: string};
export const competitors = data.products.filter(product => product.id !== 'package-broker');

export function SourceDate({sourceUrl, lastVerified, verified, label}: {
  sourceUrl: string; lastVerified: string; verified: boolean; label: string;
}) {
  return <span className="pb-compare__source"><Link className="pb-link" to={sourceUrl}>{label}</Link> · {verified ? 'Checked' : 'Reviewed'} <time dateTime={lastVerified}>{lastVerified}</time></span>;
}

export function CellValue({cell, productName, criterion}: {cell: ComparisonCell; productName: string; criterion: string}) {
  return <span className="pb-table__value pb-compare__cell">
    <span className={cell.verified ? undefined : 'pb-compare__verify'}>{cell.verified ? cell.value : 'Not verified'}</span>
    {cell.verified && cell.planName && <span className="pb-compare__source">Plan: {cell.planName}</span>}
    <SourceDate {...cell} label={`${productName}: ${criterion.toLowerCase()} source${cell.verified ? '' : ' to check'}`}/>
  </span>;
}

export default function ComparisonTable({competitorId}: {competitorId?: string}) {
  const summary = !competitorId;
  const products = summary ? data.products : data.products.filter(product => product.id === 'package-broker' || product.id === competitorId);
  const rows = summary ? data.summaryCriteria : data.criteria.map(row => ({label: row.label, criterionIds: [row.id]}));
  const prefix = summary ? 'summary' : competitorId;
  const oldest = data.criteria.flatMap(row => row.cells.filter(cell => products.some(product => product.id === cell.productId))).map(cell => cell.lastVerified).sort()[0];
  return <div className="pb-site-table pb-container">
    <table className={`pb-table pb-table--compare${summary ? ' pb-table--keep pb-table--summary' : ''}`} role="table">
      <caption>{products.map(product => product.name).join(', ')} by criterion. Oldest source review: <time dateTime={oldest}>{oldest}</time>. “Not verified” means the available research did not confirm the claim.</caption>
      <thead role="rowgroup"><tr role="row"><th id={`${prefix}-criterion`} scope="col" role="columnheader">Criterion</th>{products.map(product => <th key={product.id} id={`${prefix}-${product.id}`} scope="col" role="columnheader" className={product.id === 'package-broker' ? 'pb-col-pb' : undefined}>{product.name}</th>)}</tr></thead>
      <tbody role="rowgroup">{rows.map(row => <tr key={row.criterionIds[0]} role="row">
        <th id={`${prefix}-${row.criterionIds[0]}`} headers={`${prefix}-criterion`} scope="row" role="rowheader">{row.label}</th>
        {products.map(product => <td key={product.id} role="cell" headers={`${prefix}-${row.criterionIds[0]} ${prefix}-${product.id}`} className={product.id === 'package-broker' ? 'pb-col-pb' : undefined}>
          <span className="pb-table__cell-label" aria-hidden="true">{product.name}</span>
          <span className="pb-table__value pb-compare__cell">{row.criterionIds.map(id => <CellValue key={id} cell={data.criteria.find(criterion => criterion.id === id)!.cells.find(cell => cell.productId === product.id)!} productName={product.name} criterion={data.criteria.find(criterion => criterion.id === id)!.label}/>)}</span>
        </td>)}
      </tr>)}</tbody>
    </table>
    {summary && <p className="pb-table-note">This width shows Package Broker only. Open a comparison below to read both products by criterion.</p>}
  </div>;
}
