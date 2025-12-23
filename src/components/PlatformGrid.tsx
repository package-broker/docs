import React from 'react';
import Link from '@docusaurus/Link';
import { Box, Cloud, Server, Layers, Database, Globe } from 'lucide-react';
import styles from './PlatformGrid.module.css';

interface Platform {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'available' | 'coming-soon' | 'planned';
  link?: string;
}

const platforms: Platform[] = [
  {
    name: 'Docker',
    description: '1-Click Setup',
    icon: <Box size={32} />,
    status: 'coming-soon',
    link: '/docs/installation/docker',
  },
  {
    name: 'Cloudflare',
    description: 'Workers',
    icon: <Cloud size={32} />,
    status: 'available',
    link: '/docs/installation/cloudflare',
  },
  {
    name: 'AWS',
    description: 'App Runner',
    icon: <Database size={32} />,
    status: 'planned',
  },
  {
    name: 'VPS',
    description: 'Ubuntu/Debian',
    icon: <Server size={32} />,
    status: 'planned',
    link: '/docs/installation/vps-ubuntu',
  },
  {
    name: 'Kubernetes',
    description: 'Helm Chart',
    icon: <Layers size={32} />,
    status: 'planned',
    link: '/docs/installation/kubernetes',
  },
  {
    name: 'DigitalOcean',
    description: 'Apps Platform',
    icon: <Globe size={32} />,
    status: 'planned',
  },
];

export default function PlatformGrid() {
  return (
    <div className={styles.platformGrid}>
      {platforms.map((platform, idx) => (
        <div
          key={idx}
          className={`${styles.platformCard} ${styles[platform.status]}`}
        >
          <div className={styles.platformIcon}>{platform.icon}</div>
          <h3 className={styles.platformName}>{platform.name}</h3>
          <p className={styles.platformDescription}>{platform.description}</p>
          {platform.status === 'available' && platform.link ? (
            <Link
              to={platform.link}
              className={styles.platformButton}
            >
              Try Now
            </Link>
          ) : platform.status === 'coming-soon' ? (
            <span className={styles.comingSoonBadge}>Coming Soon</span>
          ) : (
            <span className={styles.plannedBadge}>Planned</span>
          )}
        </div>
      ))}
    </div>
  );
}

