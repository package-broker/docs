import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {usePluginData} from '@docusaurus/useGlobalData';

type Page = {title: string; description: string; image: string};

// Render after the route's own metadata so Helmet replaces short descriptions
// from synced docs. Docusaurus SiteMetadata remains the sole canonical owner.
function PageHead() {
  const {pathname: locationPath} = useLocation();
  const pathname = locationPath.replace(/\/$/, '') || '/';
  const {siteConfig: {url, title: siteTitle}} = useDocusaurusContext();
  const {pages} = usePluginData('page-metadata') as {pages: Record<string, Page>};
  const page = pages[pathname] ?? pages['/404.html'];
  const title = `${page.title} | ${siteTitle}`;
  const schema = pathname === '/' ? {
    '@context': 'https://schema.org',
    '@graph': [
      {'@type': 'SoftwareApplication', name: siteTitle, applicationCategory: 'DeveloperApplication', operatingSystem: 'Cloudflare Workers, Node.js', url, description: page.description},
      {'@type': 'Organization', name: siteTitle, url, logo: `${url}/img/logo.svg`},
    ],
  } : {
    '@context': 'https://schema.org',
    '@type': pathname.startsWith('/docs/') ? 'TechArticle' : 'WebPage',
    name: page.title, headline: page.title, description: page.description, url: `${url}${pathname}`,
  };
  return <Head>
    <title>{title}</title>
    <meta name="description" content={page.description}/>
    <meta property="og:title" content={title}/>
    <meta property="og:description" content={page.description}/>
    <meta property="og:type" content={pathname.startsWith('/docs/') ? 'article' : 'website'}/>
    <meta property="og:image" content={`${url}${page.image}`}/>
    <meta property="og:image:width" content="1200"/>
    <meta property="og:image:height" content="630"/>
    <meta property="og:image:alt" content={`${page.title} — ${siteTitle}`}/>
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:image" content={`${url}${page.image}`}/>
    <script id="pb-page-schema" type="application/ld+json">{JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
  </Head>;
}

export default function Root({children}: {children: ReactNode}) {
  return <>{children}<PageHead/></>;
}
