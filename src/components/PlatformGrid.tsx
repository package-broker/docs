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
  bestFor?: string;
  recommended?: boolean;
}

const platforms: Platform[] = [
  {
    name: 'Docker',
    description: '1-Click Setup',
    icon: <Box size={32} />,
    status: 'coming-soon',
    link: '/docs/installation/docker',
    bestFor: 'Self-hosted deployments',
  },
  {
    name: 'Cloudflare',
    description: 'Workers',
    icon: <Cloud size={32} />,
    status: 'available',
    link: '/docs/installation/cloudflare',
    bestFor: 'Free tier + edge cache',
    recommended: true,
  },
  {
    name: 'AWS',
    description: 'App Runner',
    icon: <Database size={32} />,
    status: 'planned',
    bestFor: 'AWS-native infrastructure',
  },
  {
    name: 'VPS',
    description: 'Ubuntu/Debian',
    icon: <Server size={32} />,
    status: 'planned',
    link: '/docs/installation/vps-ubuntu',
    bestFor: 'Traditional server hosting',
  },
  {
    name: 'Kubernetes',
    description: 'Helm Chart',
    icon: <Layers size={32} />,
    status: 'planned',
    link: '/docs/installation/kubernetes',
    bestFor: 'K8s clusters',
  },
  {
    name: 'DigitalOcean',
    description: 'Apps Platform',
    icon: <Globe size={32} />,
    status: 'planned',
    bestFor: 'DO App Platform',
  },
];

export default function PlatformGrid() {
  return (
    <div className={styles.platformSection}>
      <div className={styles.platformGrid}>
        {platforms.map((platform, idx) => (
          <div
            key={idx}
            className={`${styles.platformCard} ${styles[platform.status]} ${
              platform.recommended ? styles.recommended : ''
            }`}
          >
            {platform.recommended && (
              <div className={styles.recommendedRibbon}>Recommended</div>
            )}
            <div className={styles.platformIcon}>{platform.icon}</div>
            <h3 className={styles.platformName}>{platform.name}</h3>
            <p className={styles.platformDescription}>{platform.description}</p>
            {platform.bestFor && (
              <p className={styles.bestFor}>Best for: {platform.bestFor}</p>
            )}
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
      <div className={styles.roadmapFooter}>
        <p className={styles.roadmapText}>
          <strong>Roadmap:</strong> Docker and Kubernetes deployments are in active development as part of our architectural refactor. Cloudflare Workers is available now with a free tier for small teams.
        </p>
      </div>
    </div>
  );
}

