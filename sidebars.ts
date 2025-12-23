import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/composer-101',
        'getting-started/quickstart-docker',
        'getting-started/quickstart-cloudflare',
        'getting-started/quickstart-kubernetes',
        'getting-started/glossary',
      ],
    },
    {
      type: 'category',
      label: 'Use Cases',
      items: [
        'use-cases/eshop-extension-vendor',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/architecture',
      ],
    },
    {
      type: 'category',
      label: 'Installation',
      items: [
        'installation/docker',
        'installation/docker-compose',
        'installation/cloudflare',
      ],
    },
    {
      type: 'category',
      label: 'Migration',
      items: [
        'migration/from-satis',
        'migration/from-private-packagist',
        'migration/legal-notice',
      ],
    },
    {
      type: 'category',
      label: 'Compliance',
      items: [
        'soc2-compliance',
        'compliance/audit-logging',
        'compliance/iso-27001-compliance',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/configuration',
      ],
    },
  ],
};

export default sidebars;
