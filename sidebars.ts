import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      link: {
        type: 'doc',
        id: 'getting-started/quickstart-docker',
      },
      items: [
        'getting-started/composer-101',
        'getting-started/quickstart-docker',
        'getting-started/quickstart-cloudflare',
        'getting-started/glossary',
        'getting-started/quickstart-kubernetes',
      ],
    },
    {
      type: 'category',
      label: 'Use Cases',
      link: {
        type: 'generated-index',
        title: 'Use Cases',
        description: 'Explore how PACKAGE.broker can solve common challenges for different user types.',
        slug: '/use-cases',
      },
      items: [
        'use-cases/eshop-extension-vendor',
      ],
    },
    {
      type: 'category',
      label: 'Migration Guides',
      link: {
        type: 'generated-index',
        title: 'Migration Guides',
        description: 'Migrate your existing Composer setup to PACKAGE.broker.',
        slug: '/migration',
      },
      items: [
        'migration/legal-notice',
        'migration/from-satis',
        'migration/from-private-packagist',
      ],
    },
    {
      type: 'category',
      label: 'Security & Compliance',
      link: {
        type: 'doc',
        id: 'soc2-compliance',
      },
      items: [
        'soc2-compliance',
        'compliance/iso-27001-compliance',
        'compliance/audit-logging',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      link: {
        type: 'generated-index',
        title: 'Core Concepts',
        description: 'Understand the underlying architecture and principles of PACKAGE.broker.',
        slug: '/concepts',
      },
      items: [
        'concepts/architecture',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      link: {
        type: 'generated-index',
        title: 'API & Configuration Reference',
        description: 'Detailed reference for API endpoints, configuration options, and CLI commands.',
        slug: '/reference',
      },
      items: [
        'reference/configuration',
        'reference/api',
        'reference/cli',
        'reference/roadmap',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      link: {
        type: 'generated-index',
        title: 'Troubleshooting',
        description: 'Common issues and solutions for PACKAGE.broker deployments.',
        slug: '/troubleshooting',
      },
      items: [
        'troubleshooting/index',
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      link: {
        type: 'generated-index',
        title: 'Contributing',
        description: 'How to contribute to PACKAGE.broker development.',
        slug: '/contributing',
      },
      items: [
        'contributing/index',
      ],
    },
    'comparison',
    'STYLE_GUIDE',
  ],
};

export default sidebars;
