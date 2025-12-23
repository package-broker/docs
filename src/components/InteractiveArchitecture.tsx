import React from 'react';
import { Terminal, Database, Package, GitBranch, Box } from 'lucide-react';
import styles from './InteractiveArchitecture.module.css';

export default function InteractiveArchitecture() {
  return (
    <div className={styles.container}>
      {/* Main Row (horizontal on desktop, vertical on mobile) */}
      <div className={styles.mainRow}>
        {/* Composer Client */}
        <div className={styles.clientCard}>
          <div className={styles.clientIcon}>
            <Terminal size={24} />
          </div>
          <div className={styles.clientContent}>
            <span className={styles.clientTitle}>Composer</span>
            <span className={styles.clientSubtitle}>CLI • CI/CD</span>
          </div>
        </div>

        {/* Flow: Composer → System */}
        <div className={styles.flowConnection}>
          <div className={styles.flowTrack}>
            <div className={`${styles.flowDot} ${styles.dotRequest}`} />
            <div className={`${styles.flowDot} ${styles.dotResponse}`} />
            <div className={`${styles.flowDot} ${styles.dotResponse2}`} />
          </div>
          <span className={styles.flowLabel}>①③</span>
        </div>

        {/* System Container (PACKAGE.broker + Storage) */}
        <div className={styles.systemContainer}>
          <div className={styles.systemInner}>
            {/* PACKAGE.broker */}
            <div className={styles.brokerCard}>
              <div className={styles.brokerIcon}>
                <Package size={28} />
              </div>
              <span className={styles.brokerTitle}>PACKAGE.broker</span>
              <span className={styles.brokerSubtitle}>Gateway & Cache</span>
            </div>

            {/* Internal Flow: Broker ↔ Storage */}
            <div className={styles.internalFlow}>
              <div className={styles.internalTrack}>
                <div className={`${styles.flowDot} ${styles.dotCacheStore}`} />
                <div className={`${styles.flowDot} ${styles.dotCacheRead}`} />
              </div>
            </div>

            {/* Storage */}
            <div className={styles.storageCard}>
              <div className={styles.storageIcon}>
                <Database size={20} />
              </div>
              <div className={styles.storageContent}>
                <span className={styles.storageTitle}>Storage</span>
                <span className={styles.storageSubtitle}>S3 • R2 • MinIO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flow: System → Sources */}
        <div className={styles.flowConnection}>
          <div className={styles.flowTrack}>
            <div className={`${styles.flowDot} ${styles.dotFetch}`} />
            <div className={`${styles.flowDot} ${styles.dotFetchReturn}`} />
          </div>
          <span className={styles.flowLabel}>②</span>
        </div>

        {/* Package Sources */}
        <div className={styles.sourcesContainer}>
          <span className={styles.sourcesLabel}>Package Sources</span>
          <div className={styles.sourcesGrid}>
            <div className={styles.sourceGroup}>
              <span className={styles.sourceGroupLabel}>Git Repos</span>
              <div className={styles.sourceItems}>
                <div className={styles.sourceItem}>
                  <GitBranch size={14} />
                  <span>GitHub</span>
                </div>
                <div className={styles.sourceItem}>
                  <GitBranch size={14} />
                  <span>GitLab</span>
                </div>
                <div className={styles.sourceItem}>
                  <GitBranch size={14} />
                  <span>Bitbucket</span>
                </div>
              </div>
            </div>
            <div className={styles.sourceGroup}>
              <span className={styles.sourceGroupLabel}>Composer Repos</span>
              <div className={styles.sourceItems}>
                <div className={styles.sourceItem}>
                  <Box size={14} />
                  <span>Packagist</span>
                </div>
                <div className={styles.sourceItem}>
                  <Box size={14} />
                  <span>Private</span>
                </div>
                <div className={styles.sourceItem}>
                  <Box size={14} />
                  <span>Satis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
