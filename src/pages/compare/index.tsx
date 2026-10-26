import Link from '@docusaurus/Link';
import MarketingLayout, {PageSection} from '../../components/marketing/MarketingLayout';
import {releaseStatus} from '../../data/landing';
import {competitors, SourceDate} from '../../components/compare/ComparisonTable';

export default function Compare() {
  return <MarketingLayout title="Private Composer registry alternatives" description="Compare Package Broker with Private Packagist, Satis and Packeton using sourced comparisons, checked dates and migration guides for each registry.">
    <div className="pb-hero pb-hero--page"><p className="pb-eyebrow">Compare</p><h1>Private Composer registry alternatives</h1><p className="pb-hero__sub">Compare access boundaries, package formats and what you operate. Each comparison records its sources and checked dates.</p><p className="pb-page-meta">Package Broker {releaseStatus}.</p></div>
    <PageSection id="comparisons" title="Choose a comparison">
      <ul>{competitors.map(product => <li key={product.id}>
        <h3><Link className="pb-link" to={`/compare/${product.id}`}>Package Broker and {product.name}, compared</Link></h3>
        <SourceDate {...product.fit!} label={product.id === 'private-packagist' ? 'Private Packagist pricing' : `${product.name} documentation`}/>
      </li>)}</ul>
    </PageSection>
    <PageSection id="migration" title="Plan your migration">
      <ul>{competitors.filter(product => product.migration?.published).map(product => <li key={product.id}><Link className="pb-link" to={product.migration!.href}>Migrate from {product.name}</Link></li>)}</ul>
    </PageSection>
  </MarketingLayout>;
}
