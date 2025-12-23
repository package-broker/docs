import React from 'react';
import { Lock, Zap, Shield } from 'lucide-react';
import styles from './AgencyUseCases.module.css';

interface UseCase {
  icon: React.ReactNode;
  title: string;
  problem: string;
  solution: string;
  outcome: string;
}

const useCases: UseCase[] = [
  {
    icon: <Lock size={32} />,
    title: 'Sell Premium Extensions Securely',
    problem: 'You need to distribute premium Magento/Shopify extensions to paying customers without exposing source code.',
    solution: 'PACKAGE.broker provides token-based authentication, so only authorized clients can access your private packages.',
    outcome: 'Protect your IP while maintaining seamless installation for customers.',
  },
  {
    icon: <Zap size={32} />,
    title: 'Speed Up CI/CD Installs',
    problem: 'CI pipelines wait minutes for packages to download from GitHub or external sources, slowing down deployments.',
    solution: 'PACKAGE.broker caches packages at the edge, serving them instantly to your CI/CD runners.',
    outcome: 'Reduce CI install times from minutes to seconds, cutting build costs and improving developer experience.',
  },
  {
    icon: <Shield size={32} />,
    title: 'Keep Dependencies Under Control',
    problem: 'Managing private packages across multiple projects requires manual updates and version tracking.',
    solution: 'Centralize all private packages in one place with webhook-triggered updates and version management.',
    outcome: 'One source of truth for all dependencies, with automatic updates and complete audit trails.',
  },
];

export default function AgencyUseCases() {
  return (
    <div className={styles.useCasesContainer}>
      <div className={styles.useCasesHeader}>
        <h2 className={styles.useCasesTitle}>Built for Agencies Like Yours</h2>
        <p className={styles.useCasesSubtitle}>
          Real problems solved by PACKAGE.broker
        </p>
      </div>
      <div className={styles.useCasesGrid}>
        {useCases.map((useCase, index) => (
          <div key={index} className={styles.useCaseCard}>
            <div className={styles.useCaseIcon}>{useCase.icon}</div>
            <h3 className={styles.useCaseTitle}>{useCase.title}</h3>
            <div className={styles.useCaseContent}>
              <div className={styles.problemSection}>
                <span className={styles.sectionLabel}>Problem:</span>
                <p className={styles.problemText}>{useCase.problem}</p>
              </div>
              <div className={styles.solutionSection}>
                <span className={styles.sectionLabel}>Solution:</span>
                <p className={styles.solutionText}>{useCase.solution}</p>
              </div>
              <div className={styles.outcomeSection}>
                <span className={styles.outcomeLabel}>Result:</span>
                <p className={styles.outcomeText}>{useCase.outcome}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

