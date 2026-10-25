import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import {LandingFooter} from '../landing/SiteChrome';
import {MarketingPageContext} from './MarketingPageContext';

export default function MarketingLayout({title, description, noIndex, showLicense = true, children}: {
  title: string; description: string; noIndex?: boolean; showLicense?: boolean; children: ReactNode;
}) {
  return <MarketingPageContext.Provider value={true}>
    <Layout title={title} description={description} noFooter>
      {noIndex && <Head><meta name="robots" content="noindex, follow"/></Head>}
      <div className="pb-site">
        <main id="main" className="pb-wrap pb-page" tabIndex={-1}>{children}</main>
        <LandingFooter showLicense={showLicense}/>
      </div>
    </Layout>
  </MarketingPageContext.Provider>;
}

export function PageSection({id, title, children}: {id: string; title: ReactNode; children: ReactNode}) {
  return <section className="pb-page-section" aria-labelledby={id}><h2 id={id}>{title}</h2>{children}</section>;
}
