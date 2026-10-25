import Link from '@docusaurus/Link';
import ComparisonTable, {competitors} from '../compare/ComparisonTable';

export default function Comparison() {
  return <>
    <ComparisonTable/>
    <ul className="pb-links-row">{competitors.map(product => <li key={product.id}><Link className="pb-link" to={`/compare/${product.id}`}>Compare with {product.name}</Link></li>)}</ul>
    {competitors.some(product => product.migration?.published) && <ul className="pb-links-row">{competitors.filter(product => product.migration?.published).map(product => <li key={product.id}><Link className="pb-link" to={product.migration!.href}>Migration from {product.name}</Link></li>)}</ul>}
  </>;
}
