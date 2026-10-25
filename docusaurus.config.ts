import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import responsiveImages from './src/remark/responsive-images';
import directoryDocLinks from './src/remark/directory-doc-links';

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
      title: 'Package Broker 2.0 documentation',
      description: 'Documentation for the pre-release rewrite. Version 2.0 is not an in-place upgrade from v1.',
    },
  ]],
  themes: [[
    '@easyops-cn/docusaurus-search-local',
    {
      hashed: true,
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
          current: {label: '2.0 (pre-release)', path: 'docs', banner: 'unreleased'},
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
    image: 'img/logo.png',
    colorMode: {respectPrefersColorScheme: true},
    metadata: [
      {name: 'description', content: 'Self-hosted package registry for Composer and npm. Explore the Package Broker 2.0 pre-release documentation and v1 documentation.'},
      {name: 'keywords', content: 'composer proxy, npm registry, self-hosted packages, package broker'},
      {property: 'og:title', content: 'PACKAGE.broker - Self-hosted Package Registry'},
      {property: 'og:description', content: 'Self-hosted package registry for Composer and npm.'},
      {property: 'og:image', content: 'https://package.broker/img/logo.png'},
      {property: 'og:type', content: 'website'},
      {property: 'og:url', content: 'https://package.broker'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:title', content: 'PACKAGE.broker - Self-hosted Package Registry'},
      {name: 'twitter:description', content: 'Self-hosted package registry for Composer and npm.'},
    ],
    navbar: {
      title: 'PACKAGE.broker',
      logo: {alt: 'PACKAGE.broker', src: 'img/logo.svg'},
      items: [
        {to: '/docs/', label: 'Docs (2.0)', position: 'left'},
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
    prism: {theme: prismThemes.github, darkTheme: prismThemes.dracula},
  } satisfies Preset.ThemeConfig,
};

export default config;
