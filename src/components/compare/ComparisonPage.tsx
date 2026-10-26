import Link from '@docusaurus/Link';
import MarketingLayout, {PageSection} from '../marketing/MarketingLayout';
import ComparisonTable, {competitors, SourceDate} from './ComparisonTable';
import styles from './ComparisonPage.module.css';
import {workersQuickstart, repository} from '../../data/landing';

export default function ComparisonPage({productId}: {productId: string}) {
  const product = competitors.find(item => item.id === productId)!;
  const fit = product.fit!; // Required and verified by the build-time comparison gate.
  const title = `Package Broker and ${product.name}, compared`;
  const description = `Compare Package Broker and ${product.name}: authentication, project isolation, npm, SSO, self-hosting, licence and price model, with sources and checked dates.`;
  return <MarketingLayout title={title} description={description}><div className={styles.page}>
    <div className="pb-hero pb-hero--page"><p className="pb-eyebrow">Compare</p><h1>{title}</h1><p className="pb-hero__sub">Choose who operates your agency’s registry, how client access works and whether you need npm alongside Composer. Read when each product fits, then check the sources and recorded review dates.</p><p>{product.intro}</p><p className="pb-page-meta">Package Broker 2.0 is in development; no tagged release yet.</p></div>
    <nav aria-label="Comparison pages"><ul className="pb-links-row">{competitors.map(item => <li key={item.id}><Link className="pb-link" to={`/compare/${item.id}`} aria-current={item.id === product.id ? 'page' : undefined}>{item.name}</Link></li>)}</ul></nav>
    <aside className="pb-compare-fit" aria-labelledby="competitor-fit"><h2 id="competitor-fit">When {product.name} fits better</h2><p>{fit.value}</p><SourceDate {...fit} label={product.id === 'private-packagist' ? 'Private Packagist pricing' : `${product.name} documentation`}/></aside>
    <PageSection id="broker-fit" title="When Package Broker fits better">
      <p>Choose Package Broker if you want to operate one Composer and npm registry for your agency. Give each developer one personal token for the projects they can access; keep each client’s vendor keys in that client’s project, encrypted in the broker.</p>
      <p>Give a freelancer a grant to one project, without an organization role. CI gets a read-only service token bound to that project. Versions already installed through the broker stay available during vendor repository outages because their archives are stored by the broker.</p>
      <p>No seat counting: the software does not count or cap users. You pay for hosting and operations on Cloudflare Workers or Node. Package Broker is pre-release with one maintainer; you run backups and upgrades. Marketplace sources are built, in final verification.</p>
      <p><Link className="pb-link" to="/agencies">Agency setup and access boundaries</Link> · <Link className="pb-link" to="/security">Security model and operator responsibilities</Link></p>
    </PageSection>
    <ComparisonTable competitorId={product.id}/>
    <PageSection id="moving" title={`Moving from ${product.name}`}><div className="pb-cta-band">
      <p>{product.migration?.published ? 'Read the migration guide before switching your projects.' : 'The migration guide is being written. Describe your current registry in GitHub Discussions to ask about your migration path, or try a deployment before switching client projects.'}</p>
      <div className="pb-actions">{product.migration?.published ? <Link className="pb-btn" to={product.migration.href}>Migrate from {product.name}</Link> : <Link className="pb-btn" to={`${repository}/discussions`}>Discuss your migration</Link>}<Link className="pb-btn pb-btn--primary" to={workersQuickstart}>Start the quickstart</Link></div>
    </div></PageSection>
    <PageSection id="comparison-notice" title="About this comparison"><p>Private Packagist, Satis and Packeton are names or trademarks of their respective owners. Package Broker is not affiliated with or endorsed by those projects. This comparison uses the sources and review dates shown; features, plans and terms can change. Confirm current terms with each provider before choosing a product.</p></PageSection>
  </div></MarketingLayout>;
}
