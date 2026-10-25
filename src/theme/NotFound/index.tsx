import Link from '@docusaurus/Link';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import contacts from '../../data/contacts.json';
import {workersQuickstart} from '../../data/landing';

export default function NotFound() {
  return <MarketingLayout title="Page not found" description="This page does not exist. Search the Package Broker documentation or start with the quickstart." noIndex>
    <div className="pb-not-found">
      <div className="pb-empty"><p className="pb-eyebrow">404 · Package Broker</p><h1>This page does not exist</h1><p>The address may have changed, or it belonged to Package Broker 1.x. Search the documentation to find your next step.</p></div>
      <form className="pb-recovery-search" action="/search" method="get"><label htmlFor="recovery-search">Search documentation</label><input id="recovery-search" className="pb-input" type="search" name="q" placeholder="Project tokens" required/><div><button className="pb-btn pb-btn--primary" type="submit">Search documentation</button></div></form>
      <ul className="pb-links-row"><li><Link className="pb-link" to={workersQuickstart}>Start with the quickstart</Link></li><li><Link className="pb-link" to="/docs/architecture">Go to the documentation home</Link></li><li><Link className="pb-link" to="/">Go to the home page</Link></li></ul>
      <p className="pb-page-meta">Package Broker 1.x is no longer maintained. <Link className="pb-link" to={workersQuickstart}>Deploy 2.0</Link>.</p>
      <p>Report a broken link to <a className="pb-link" href={`mailto:${contacts.support}`}>{contacts.support}</a>.</p>
    </div>
  </MarketingLayout>;
}
