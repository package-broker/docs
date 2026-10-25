import {comparisonProducts, comparisonRows, comparisonSources} from '../data/comparison-2.0';
import styles from './ComparisonTable.module.css';

function sourceFor(id: string) {
  const source = comparisonSources.find(source => source.id === id);
  if (!source) throw new Error(`Comparison table references missing source id: "${id}"`);
  return source;
}

// Validate every reference during the production build, even if its UI is collapsed.
const rows = comparisonRows.map(row => ({...row, cells: row.cells.map(cell => ({
  ...cell, citation: cell.source ? sourceFor(cell.source) : undefined,
}))}));

export default function ComparisonTable() {
  return <>
    <div className={styles.scroll} role="region" aria-label="Registry comparison table; scroll horizontally for all products" tabIndex={0}>
      <table className={styles.table}>
        <caption>Checked 2026-10-19 against the sources below. Package Broker cells describe accepted 2.0 decisions; 2.0 has no tagged release.</caption>
        <thead><tr><th scope="col">Criterion</th>{comparisonProducts.map(product => <th scope="col" key={product}>{product}</th>)}</tr></thead>
        <tbody>{rows.map(row => <tr key={row.label}>
          <th scope="row">{row.label}</th>
          {row.cells.map((cell, index) => <td key={comparisonProducts[index]}>
            {cell.text}{!cell.verified && <> <a href="#comparison-unknown">[?]<span className={styles.visuallyHidden}> {row.label}, {comparisonProducts[index]}: documentation note</span></a></>}
          </td>)}
        </tr>)}</tbody>
      </table>
    </div>
    <p id="comparison-unknown" className={styles.note}><strong>Not documented [?]</strong> means the supplied research did not verify that capability. It does not mean the product lacks it. Private Packagist customer/suborganization access awaits re-check. Composer support is documented for Private Packagist and Packeton; npm support is unverified.</p>
    <details className={styles.sources}>
      <summary>Comparison sources, by criterion</summary>
      <ul>{comparisonSources.map(source => <li key={source.id}><a href={source.url}>{source.label}</a></li>)}</ul>
      <ul>{rows.map(row => <li key={row.label}><strong>{row.label}:</strong>{' '}{row.cells.map((cell, index) => <span key={comparisonProducts[index]}>
        {index > 0 && '; '}{comparisonProducts[index]}: {cell.citation ? <><a href={cell.citation.url}>{cell.citation.label}</a>{cell.caveat && ` (${cell.caveat})`}</> : 'Not documented; see note above'}
      </span>)}</li>)}</ul>
    </details>
  </>;
}
