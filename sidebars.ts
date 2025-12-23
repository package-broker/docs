import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
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
  ],
};

export default sidebars;
