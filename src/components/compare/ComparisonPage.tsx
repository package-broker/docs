import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import MarketingLayout, {PageSection} from '../marketing/MarketingLayout';
import ComparisonTable, {competitors, SourceDate} from './ComparisonTable';
import {workersQuickstart} from '../../data/landing';

export default function ComparisonPage({productId}: {productId: string}) {
  const product = competitors.find(item => item.id === productId)!;
  const title = `Package Broker and ${product.name}, compared`;
  const description = `Compare Package Broker and ${product.name}: authentication, project isolation, npm, SSO, self-hosting, licence and price model, with sources and checked dates.`;
  return <MarketingLayout title={title} description={description}>
    <Head><script type="application/ld+json">{JSON.stringify({'@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: `https://package.broker/compare/${product.id}`})}</script></Head>
    <div className="pb-hero pb-hero--page"><p className="pb-eyebrow">Compare</p><h1>{title}</h1><p className="pb-hero__sub">Check the mechanisms behind each criterion. Every cell links to its source and recorded review date. Unconfirmed cells say “Not verified”.</p><p className="pb-page-meta">Package Broker 2.0 is in development towards its first release candidate; no tagged release exists yet.</p></div>
    <nav aria-label="Comparison pages"><ul className="pb-links-row">{competitors.map(item => <li key={item.id}><Link className="pb-link" to={`/compare/${item.id}`} aria-current={item.id === product.id ? 'page' : undefined}>{item.name}</Link></li>)}<li><Link className="pb-link" to="/#compare">Comparison summary</Link></li></ul></nav>
    {product.fit?.verified && <aside className="pb-compare-fit" aria-labelledby="competitor-fit"><h2 id="competitor-fit">When {product.name} fits better</h2><p>{product.fit.value}</p><SourceDate {...product.fit} label={`${product.name} documentation`}/></aside>}
    <ComparisonTable competitorId={product.id}/>
    <PageSection id="moving" title={`Moving from ${product.name}`}><div className="pb-cta-band">
      <p>{product.migration?.published ? 'Read the migration guide before switching your projects.' : 'The migration guide is being written. Start by reviewing the deployment steps.'}</p>
      <div className="pb-actions">{product.migration?.published && <Link className="pb-btn" to={product.migration.href}>Migrate from {product.name}</Link>}<Link className="pb-btn pb-btn--primary" to={workersQuickstart}>Start the quickstart</Link></div>
    </div></PageSection>
    <PageSection id="comparison-notice" title="About this comparison"><p>Private Packagist, Satis and Packeton are names or trademarks of their respective owners. Package Broker is not affiliated with or endorsed by those projects. This comparison uses the sources and review dates shown; features, plans and terms can change. Confirm current terms with each provider before choosing a product.</p></PageSection>
  </MarketingLayout>;
}
