import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Package Broker',
  tagline: 'Self-hosted private Composer and npm packages',
  favicon: 'img/logo.svg',
  url: 'https://package.broker',
  baseUrl: '/',
  organizationName: 'package-broker',
  projectName: 'docs',
  onBrokenLinks: 'throw',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: false,
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
      items: [
        {
          href: 'https://github.com/package-broker/broker',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      links: [
        {
          title: 'Package Broker',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/package-broker/broker',
            },
          ],
        },
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
