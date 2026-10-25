import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import responsiveImages from './src/remark/responsive-images';
import directoryDocLinks from './src/remark/directory-doc-links';
import {landingSummary, pageDescription} from './src/data/landing';

// The LLM plugin does not filter unlisted front matter itself.
const unlistedDocs = readdirSync(path.join(__dirname, 'docs'), {recursive: true, withFileTypes: true})
  .filter(entry => entry.isFile() && /\.mdx?$/.test(entry.name))
  .map(entry => path.join(entry.parentPath, entry.name))
  .filter(file => {
    const frontMatter = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    return /^unlisted:\s*true\s*$/m.test(frontMatter);
  })
  .map(file => path.relative(__dirname, file).split(path.sep).join('/'));

const config: Config = {
  title: 'PACKAGE.broker',
  tagline: 'Self-hosted package registry for Composer and npm',
  favicon: 'img/logo.png',
  future: {v4: true, faster: true},
  url: 'https://package.broker',
  baseUrl: '/',
  trailingSlash: true,
  organizationName: 'package-broker',
  projectName: 'docs',
  onBrokenLinks: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'throw'}},
  i18n: {defaultLocale: 'en', locales: ['en']},
  plugins: [[
    'docusaurus-plugin-llms',
    {
      docsDir: [{path: 'docs', routeBasePath: 'docs'}],
      ignoreFiles: unlistedDocs,
      includeBlog: false,
      generateLLMsTxt: true,
      generateLLMsFullTxt: true,
      addMdExtension: false,
      version: '2.0 (pre-release)',
      title: 'PACKAGE.broker 2.0 — Composer and npm registry',
      description: pageDescription,
      rootContent: landingSummary,
      fullRootContent: landingSummary,
    },
  ]],
  themes: [[
    '@easyops-cn/docusaurus-search-local',
    {
      hashed: 'filename',
      indexDocs: true,
      indexPages: true,
      indexBlog: true,
      docsRouteBasePath: '/docs',
      ignoreFiles: [/^v1(?:\/|$)/],
      forceIgnoreNoIndex: false,
      highlightSearchTermsOnTargetPage: true,
    },
  ]],
  presets: [[
    'classic',
    {
      docs: {
        sidebarPath: './sidebars.ts',
        routeBasePath: '/',
        lastVersion: 'current',
        versions: {
          current: {label: '2.0 (pre-release)', path: 'docs', banner: 'none'},
          '1.x': {label: '1.x', path: 'v1', banner: 'unmaintained'},
        },
        editUrl: ({version, docPath}) => version === 'current'
          ? `https://github.com/package-broker/broker/edit/main/docs/${docPath}`
          : undefined,
        beforeDefaultRemarkPlugins: [directoryDocLinks],
        remarkPlugins: [responsiveImages],
      },
      blog: {
        showReadingTime: true,
        feedOptions: {type: ['rss', 'atom'], xslt: true},
        editUrl: 'https://github.com/package-broker/docs/tree/main/',
        onInlineTags: 'warn',
        onInlineAuthors: 'warn',
        onUntruncatedBlogPosts: 'warn',
        remarkPlugins: [responsiveImages],
      },
      theme: {customCss: './src/css/custom.css'},
      sitemap: {
        changefreq: 'weekly',
        priority: 0.5,
        ignorePatterns: ['/tags/**'],
        filename: 'sitemap.xml',
        async createSitemapItems({defaultCreateSitemapItems, ...params}) {
          const items = await defaultCreateSitemapItems(params);
          return items.map(item => ({
            ...item,
            priority: new URL(item.url).pathname.startsWith('/v1/') ? 0.2 : 0.5,
          }));
        },
      },
    } satisfies Preset.Options,
  ]],
  themeConfig: {
    image: 'img/og-2.0.png',
    metadata: [
      {name: 'description', content: pageDescription},
      {name: 'twitter:card', content: 'summary_large_image'},
    ],
    colorMode: {respectPrefersColorScheme: true},
    navbar: {
      title: 'PACKAGE.broker',
      logo: {alt: '', src: 'img/logo.svg', width: 32, height: 32},
      items: [
        {to: '/docs/', label: 'Docs (2.0)', position: 'left'},
        {to: '/#compare', label: 'Compare', position: 'left'},
        {to: '/v1/', label: 'v1 docs', position: 'left'},
        {href: 'https://github.com/package-broker/broker', label: 'GitHub', position: 'left'},
        {href: 'https://github.com/package-broker/broker/blob/main/SECURITY.md', label: 'Security policy', position: 'left'},
        {type: 'docsVersionDropdown', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {title: 'Documentation', items: [
          {label: 'Docs (2.0)', to: '/docs/'},
          {label: 'v1 docs', to: '/v1/'},
        ]},
        {title: 'Project', items: [
          {label: 'GitHub', href: 'https://github.com/package-broker/broker'},
          {label: 'Security policy', href: 'https://github.com/package-broker/broker/blob/main/SECURITY.md'},
          {label: 'Blog', to: '/blog/'},
        ]},
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Lukasz Bajsarowicz. Built with Docusaurus.`,
    },
    prism: {
      theme: {
        ...prismThemes.github,
        styles: [...prismThemes.github.styles,
          {types: ['comment', 'prolog', 'doctype', 'cdata'], style: {color: '#5b616b'}},
          {types: ['entity', 'url', 'symbol', 'number', 'boolean', 'variable', 'constant', 'property', 'regex', 'inserted'], style: {color: '#176965'}},
          {types: ['atrule', 'keyword', 'attr-name', 'selector'], style: {color: '#006b8f'}},
          {types: ['string', 'attr-value'], style: {color: '#b50d53'}},
          {types: ['function', 'deleted', 'tag'], style: {color: '#b42332'}},
        ],
      },
      darkTheme: {
        ...prismThemes.dracula,
        styles: [...prismThemes.dracula.styles,
          {types: ['comment'], style: {color: '#a7b2d5'}},
          {types: ['deleted'], style: {color: '#ff7d85'}},
        ],
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
