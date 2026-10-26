import Link from '@docusaurus/Link';
import data from '../../data/comparison.json';

export type ComparisonCell = (typeof data.criteria)[number]['cells'][number] & {
  planName?: string; priceSourceUrl?: string; status?: string;
  additionalSources?: {sourceUrl: string; quote: string}[];
};
export const competitors = data.products.filter(product => product.id !== 'package-broker');

export function SourceDate({sourceUrl, lastVerified, verified, label}: {
  sourceUrl: string; lastVerified: string; verified: boolean; label: string;
}) {
  const destination = sourceUrl.startsWith('https://package.broker/docs/') ? sourceUrl.slice('https://package.broker'.length) : sourceUrl;
  return <span className="pb-compare__source"><Link className="pb-link" to={destination}>{label}</Link> · {verified ? 'Checked' : 'Reviewed'} <time dateTime={lastVerified}>{lastVerified}</time></span>;
}

export function CellValue({cell, productName, criterion, showCriterion = false}: {cell: ComparisonCell; productName: string; criterion: string; showCriterion?: boolean}) {
  return <span className="pb-table__value pb-compare__cell">
    {showCriterion && <strong>{criterion}: </strong>}
    <span className={cell.verified ? undefined : 'pb-compare__verify'}>{cell.verified ? cell.value : cell.status === 'not-documented' ? 'Not documented in the reviewed source.' : 'Unknown: not confirmed by the recorded source.'}</span>
    {cell.verified && cell.planName && <span className="pb-compare__source">Plan: {cell.planName}</span>}
    <SourceDate {...cell} label={`${productName}: ${criterion.toLowerCase()} source`}/>
    {cell.additionalSources?.map(source => <SourceDate key={source.sourceUrl} sourceUrl={source.sourceUrl} lastVerified={cell.lastVerified} verified={cell.verified} label={`${productName}: ${criterion.toLowerCase()} supporting source`}/>)}
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
      <caption>{products.map(product => product.name).join(', ')} by criterion. Oldest source review: <time dateTime={oldest}>{oldest}</time>. “Unknown” means the recorded source has not confirmed this detail; it does not mean the feature is absent. “Not documented” means the reviewed documentation does not state support.</caption>
      <thead role="rowgroup"><tr role="row"><th id={`${prefix}-criterion`} scope="col" role="columnheader">Criterion</th>{products.map(product => <th key={product.id} id={`${prefix}-${product.id}`} scope="col" role="columnheader" className={product.id === 'package-broker' ? 'pb-col-pb' : undefined}>{product.name}</th>)}</tr></thead>
      <tbody role="rowgroup">{rows.map(row => <tr key={row.criterionIds[0]} role="row">
        <th id={`${prefix}-${row.criterionIds[0]}`} headers={`${prefix}-criterion`} scope="row" role="rowheader">{row.label}</th>
        {products.map(product => <td key={product.id} role="cell" headers={`${prefix}-${row.criterionIds[0]} ${prefix}-${product.id}`} className={product.id === 'package-broker' ? 'pb-col-pb' : undefined}>
          <span className="pb-table__cell-label" aria-hidden="true">{product.name}</span>
          {row.criterionIds.map(id => <CellValue key={id} cell={data.criteria.find(criterion => criterion.id === id)!.cells.find(cell => cell.productId === product.id)!} productName={product.name} criterion={data.criteria.find(criterion => criterion.id === id)!.label} showCriterion={row.criterionIds.length > 1}/>)}
        </td>)}
      </tr>)}</tbody>
    </table>
    {summary && <p className="pb-table-note">This width shows Package Broker only. Open a comparison below to read both products by criterion.</p>}
  </div>;
}
