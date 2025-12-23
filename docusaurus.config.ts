import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import responsiveImages from './src/remark/responsive-images';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'PACKAGE.broker',
  tagline: 'Minimalistic, SOC-2 Compatible Composer Mirror',
  favicon: 'img/logo.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://package.broker',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'package-broker',
  projectName: 'docs',

  onBrokenLinks: 'warn',

  // Internationalization
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/package-broker/docs/tree/main/',
          remarkPlugins: [responsiveImages],
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/package-broker/docs/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
          remarkPlugins: [responsiveImages],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        // Sitemap configuration
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
    // Social card image
    image: 'img/logo.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    // SEO metadata
    metadata: [
      { 
        name: 'description', 
        content: 'Open source Composer repository proxy for small agencies and enterprises. Self-hosted private package management with SOC2 compliance. Alternative to commercial SaaS - zero cost with Docker, Cloudflare Workers, or VPS.' 
      },
      { 
        name: 'keywords', 
        content: 'composer proxy, php package management, self-hosted composer, magento composer cache, soc2 compliance, docker composer mirror, composer repository hosting, php package mirror security, composer private packages, self-hosted package repository' 
      },
      { property: 'og:title', content: 'PACKAGE.broker - Private Composer Repository Hosting' },
      { property: 'og:description', content: 'Open source, SOC2-compliant Composer proxy for small agencies and enterprises. Self-hosted with Docker, Cloudflare Workers, or Kubernetes.' },
      { property: 'og:image', content: 'https://package.broker/img/logo.png' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://package.broker' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'PACKAGE.broker - Private Composer Repository Hosting' },
      { name: 'twitter:description', content: 'Open source, SOC2-compliant Composer proxy for small agencies and enterprises.' },
    ],
    navbar: {
      title: 'PACKAGE.broker',
      logo: {
        alt: 'PACKAGE.broker Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/docs/installation/cloudflare',
          label: 'Deploy',
          position: 'left',
        },
        {
          to: '/docs/soc2-compliance',
          label: 'Security',
          position: 'left',
        },
        {
          to: '#calculate-savings',
          label: 'Savings',
          position: 'left',
        },
        {
          type: 'html',
          position: 'right',
          value: '<a href="https://github.com/package-broker/server" target="_blank" rel="noopener noreferrer" class="navbar__link navbar__stars" style="display:flex;align-items:center;margin-right:1rem;"><img src="https://img.shields.io/github/stars/package-broker/server?style=social&label=Stars" alt="GitHub Stars" height="20" /></a>',
        },
        {
          to: '/docs/',
          label: 'Get Started',
          position: 'right',
          className: 'navbar__cta-button',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/package-broker/server/discussions',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/package-broker/server',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Lukasz Bajsarowicz. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
