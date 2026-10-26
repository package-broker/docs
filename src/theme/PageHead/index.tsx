import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {usePluginData} from '@docusaurus/useGlobalData';

import {definition, runtimes, licence, repositoryUrl, organizationUrl, maintainer} from '@site/src/data/entity';

type Page = {title: string; description: string; image: string; noIndex?: boolean; dateModified?: string};

// Mount with the page metadata, after its default Head. Docusaurus
// SiteMetadata remains the sole canonical owner.
export default function PageHead() {
  const {pathname: locationPath} = useLocation();
  const pathname = locationPath.replace(/\/$/, '') || '/';
  const {siteConfig: {url, title: siteTitle}} = useDocusaurusContext();
  const {pages} = usePluginData('page-metadata') as {pages: Record<string, Page>};
  const page = pages[pathname] ?? pages['/404.html'];
  const title = `${page.title} | ${siteTitle}`;
  const schema = pathname === '/' ? {
    '@context': 'https://schema.org',
    '@graph': [
      {'@type': 'SoftwareApplication', name: siteTitle, applicationCategory: 'DeveloperApplication', operatingSystem: runtimes, url, description: definition, license: licence.url, sameAs: [repositoryUrl], author: {'@type': 'Person', ...maintainer}, maintainer: {'@type': 'Person', ...maintainer}},
      {'@type': 'Organization', name: siteTitle, url, logo: `${url}/img/logo.svg`, sameAs: [organizationUrl, repositoryUrl]},
    ],
  } : {
    '@context': 'https://schema.org',
    '@type': pathname.startsWith('/docs/') ? 'TechArticle' : 'WebPage',
    ...(page.dateModified ? {dateModified: page.dateModified} : {}),
    name: page.title, headline: page.title, description: page.description, url: `${url}${pathname}`,
  };
  return <Head>
    {page.noIndex && <meta name="robots" content="noindex, follow"/>}
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
