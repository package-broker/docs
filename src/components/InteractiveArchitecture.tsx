import React from 'react';
import { Terminal, Cloud, Database, Package, GitBranch, Server } from 'lucide-react';
import styles from './InteractiveArchitecture.module.css';

export default function InteractiveArchitecture() {
  return (
    <div className={styles.architectureContainer}>
      {/* Composer Client */}
      <div className={styles.clientBox}>
        <div className={styles.iconWrapper}>
          <Terminal size={32} />
        </div>
        <h3 className={styles.boxTitle}>Composer Client</h3>
        <p className={styles.boxSubtitle}>PHP • CI/CD • Local Dev</p>
        <div className={`${styles.connectionLine} ${styles.toCenter}`} />
      </div>

      {/* PACKAGE.broker (Center) */}
      <div className={styles.centerBox}>
        <div className={styles.centerIconWrapper}>
          <Package size={40} />
        </div>
        <h2 className={styles.centerTitle}>PACKAGE.broker</h2>
        <span className={styles.centerBadge}>Edge Proxy & Cache</span>
        <div className={styles.connections}>
          <div className={`${styles.connectionLine} ${styles.fromClient}`} />
          <div className={`${styles.connectionLine} ${styles.toStorage}`} />
          <div className={`${styles.connectionLine} ${styles.fromSources}`} />
        </div>
      </div>

      {/* Source Repositories */}
      <div className={styles.sourcesBox}>
        <div className={styles.sourceItem}>
          <div className={styles.sourceIcon}>
            <GitBranch size={24} />
          </div>
          <div className={styles.sourceText}>
            <span className={styles.sourceName}>GitHub</span>
            <span className={styles.sourceSubtitle}>Private Repos</span>
          </div>
        </div>
        <div className={styles.sourceItem}>
          <div className={styles.sourceIcon}>
            <GitBranch size={24} />
          </div>
          <div className={styles.sourceText}>
            <span className={styles.sourceName}>GitLab</span>
            <span className={styles.sourceSubtitle}>Bitbucket</span>
          </div>
        </div>
        <div className={`${styles.connectionLine} ${styles.fromSourcesToCenter}`} />
      </div>

      {/* Storage */}
      <div className={styles.storageBox}>
        <div className={styles.iconWrapper}>
          <Database size={32} />
        </div>
        <h3 className={styles.boxTitle}>Storage</h3>
        <p className={styles.boxSubtitle}>S3 • R2 • MinIO</p>
        <div className={`${styles.connectionLine} ${styles.fromCenter}`} />
      </div>

      {/* Flow Labels */}
      <div className={styles.flowLabel} style={{ top: '45%', left: '25%' }}>
        <span className={styles.flowArrow}>→</span>
        <span className={styles.flowText}>Request Package</span>
      </div>
      <div className={styles.flowLabel} style={{ top: '45%', right: '25%' }}>
        <span className={styles.flowArrow}>→</span>
        <span className={styles.flowText}>Cache & Serve</span>
      </div>
      <div className={styles.flowLabel} style={{ top: '15%', left: '50%', transform: 'translateX(-50%)' }}>
        <span className={styles.flowArrow}>↓</span>
        <span className={styles.flowText}>Fetch on Miss</span>
      </div>
    </div>
  );
}

