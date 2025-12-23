import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import styles from './ComparisonTable.module.css';

interface ComparisonRow {
  feature: string;
  packageBroker: string | React.ReactNode;
  privatePackagist: string | React.ReactNode;
  satis: string | React.ReactNode;
  packeton: string | React.ReactNode;
  repman: string | React.ReactNode;
}

const rows: ComparisonRow[] = [
  {
    feature: 'Cost',
    packageBroker: '€0-60/year',
    privatePackagist: '€700-3500/year',
    satis: 'Server costs',
    packeton: 'Server costs',
    repman: 'Server costs',
  },
  {
    feature: 'Setup Time',
    packageBroker: '10 minutes',
    privatePackagist: 'Instant',
    satis: '30 min',
    packeton: '45 min',
    repman: '60 min',
  },
  {
    feature: 'Maintenance',
    packageBroker: 'Zero (Docker)',
    privatePackagist: 'Zero (SaaS)',
    satis: 'Manual',
    packeton: 'Manual',
    repman: 'Manual',
  },
  {
    feature: 'SOC2 Ready',
    packageBroker: <Check className={styles.checkIcon} size={18} />,
    privatePackagist: <Check className={styles.checkIcon} size={18} />,
    satis: <X className={styles.xIcon} size={18} />,
    packeton: <AlertCircle className={styles.partialIcon} size={18} />,
    repman: <AlertCircle className={styles.partialIcon} size={18} />,
  },
  {
    feature: 'Edge Caching',
    packageBroker: <Check className={styles.checkIcon} size={18} />,
    privatePackagist: <X className={styles.xIcon} size={18} />,
    satis: <X className={styles.xIcon} size={18} />,
    packeton: <X className={styles.xIcon} size={18} />,
    repman: <X className={styles.xIcon} size={18} />,
  },
  {
    feature: 'UI Dashboard',
    packageBroker: 'Modern',
    privatePackagist: 'Yes',
    satis: <X className={styles.xIcon} size={18} />,
    packeton: 'Basic',
    repman: 'Advanced',
  },
  {
    feature: 'Webhook Sync',
    packageBroker: <Check className={styles.checkIcon} size={18} />,
    privatePackagist: <Check className={styles.checkIcon} size={18} />,
    satis: <X className={styles.xIcon} size={18} />,
    packeton: <Check className={styles.checkIcon} size={18} />,
    repman: <Check className={styles.checkIcon} size={18} />,
  },
  {
    feature: 'Docker 1-Click',
    packageBroker: <Check className={styles.checkIcon} size={18} />,
    privatePackagist: 'N/A',
    satis: <X className={styles.xIcon} size={18} />,
    packeton: <AlertCircle className={styles.partialIcon} size={18} />,
    repman: <AlertCircle className={styles.partialIcon} size={18} />,
  },
  {
    feature: 'Multi-Platform',
    packageBroker: <Check className={styles.checkIcon} size={18} />,
    privatePackagist: 'N/A',
    satis: <X className={styles.xIcon} size={18} />,
    packeton: <X className={styles.xIcon} size={18} />,
    repman: <X className={styles.xIcon} size={18} />,
  },
];

export default function ComparisonTable() {
  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th className={styles.featureColumn}>Feature</th>
              <th className={styles.highlightColumn}>PACKAGE.broker</th>
              <th>Private Packagist</th>
              <th>Satis</th>
              <th>Packeton</th>
              <th>Repman</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className={styles.featureCell}>{row.feature}</td>
                <td className={styles.highlightCell}>{row.packageBroker}</td>
                <td>{row.privatePackagist}</td>
                <td>{row.satis}</td>
                <td>{row.packeton}</td>
                <td>{row.repman}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.disclaimer}>
        *Compared to commercial Composer repository services. All trademarks are property of their respective owners. This project is not affiliated with or endorsed by any third-party services.
      </p>
    </div>
  );
}

