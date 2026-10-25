import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {assertDocsSynced, isPlannedDoc} from './scripts/docs-content.cjs';
import {headerLinks, footerLinks} from './src/data/landing';

// Read on every config load: a missing sync must never render an empty docs site.
assertDocsSynced();

const config: Config = {
  title: 'Package Broker',
  tagline: 'Self-hosted private Composer and npm packages',
  favicon: 'img/logo.svg',
  url: 'https://package.broker',
  baseUrl: '/',
  trailingSlash: false,
  organizationName: 'package-broker',
  projectName: 'docs',
  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
    hooks: {onBrokenMarkdownLinks: 'throw'},
  },
  themes: ['@docusaurus/theme-mermaid'],
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs-content',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl: ({docPath}) => `https://github.com/package-broker/broker/edit/main/docs/${docPath}`,
          async sidebarItemsGenerator(args) {
            const items = await args.defaultSidebarItemsGenerator(args);
            const planned = new Map(args.docs
              .filter(doc => isPlannedDoc(args.version.contentPath, doc.source))
              .map(doc => [doc.id, doc.title]));
            const markPlanned = (entries: typeof items): typeof items => entries.map(item => {
              if (item.type === 'category') return {
                ...item,
                label: item.link?.type === 'doc' && planned.has(item.link.id)
                  ? `${item.label} — Planned` : item.label,
                items: markPlanned(item.items),
              };
              if (item.type === 'doc' && planned.has(item.id)) {
                return {...item, label: `${item.label ?? planned.get(item.id)} — Planned`};
              }
              return item;
            });
            return markPlanned(items);
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Package Broker',
      logo: {
        alt: 'Package Broker',
        src: 'img/logo.svg',
      },
      items: headerLinks.map(({label, href}) => ({label, href, position: 'right' as const})),
    },
    footer: {
      links: [{title: 'Package Broker', items: footerLinks}],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
