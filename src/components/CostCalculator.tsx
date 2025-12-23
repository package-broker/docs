import { useState } from 'react';
import clsx from 'clsx';
import { TrendingDown, Clock, DollarSign } from 'lucide-react';
import styles from './CostCalculator.module.css';

export default function CostCalculator() {
  const [teamSize, setTeamSize] = useState(5);
  const [currentSolution, setCurrentSolution] = useState('packagist');
  const [deploymentType, setDeploymentType] = useState('cloudflare');

  const calculateSavings = () => {
    let annualCost = 0;
    if (currentSolution === 'packagist') {
      // Private Packagist pricing: €700-3500/year based on team size
      annualCost = teamSize <= 5 ? 700 : teamSize <= 15 ? 1400 : 3500;
    } else if (currentSolution === 'satis') {
      // Estimated server costs for Satis
      annualCost = 240;
    } else {
      // Other commercial solutions
      annualCost = 500;
    }

    let packageBrokerCost = 0;
    if (deploymentType === 'cloudflare') {
      packageBrokerCost = 0; // Free tier
    } else if (deploymentType === 'docker') {
      packageBrokerCost = 60; // Estimated VPS costs
    } else {
      packageBrokerCost = 120; // Kubernetes/other
    }

    const savings = annualCost - packageBrokerCost;
    const setupTime = deploymentType === 'cloudflare' ? 10 : 15;
    const maintenanceHours = deploymentType === 'cloudflare' ? 0 : 1;

    return { savings, annualCost, packageBrokerCost, setupTime, maintenanceHours };
  };

  const { savings, annualCost, packageBrokerCost, setupTime, maintenanceHours } = calculateSavings();

  return (
    <div className={styles.calculatorContainer}>
      <h3 className={styles.calculatorTitle}>ROI Calculator</h3>
      <p className={styles.calculatorSubtitle}>
        See how much you can save by switching to PACKAGE.broker
      </p>

      <div className={styles.inputs}>
        <div className={styles.inputGroup}>
          <label htmlFor="teamSize">Team Size</label>
          <input
            id="teamSize"
            type="range"
            min="1"
            max="50"
            value={teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.sliderValue}>{teamSize} developers</span>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="currentSolution">Current Solution</label>
          <select
            id="currentSolution"
            value={currentSolution}
            onChange={(e) => setCurrentSolution(e.target.value)}
            className={styles.select}
          >
            <option value="packagist">Private Packagist</option>
            <option value="satis">Satis (Self-hosted)</option>
            <option value="other">Other Commercial</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="deploymentType">Deployment Type</label>
          <select
            id="deploymentType"
            value={deploymentType}
            onChange={(e) => setDeploymentType(e.target.value)}
            className={styles.select}
          >
            <option value="cloudflare">Cloudflare Workers (Free)</option>
            <option value="docker">Docker (VPS)</option>
            <option value="kubernetes">Kubernetes</option>
          </select>
        </div>
      </div>

      <div className={styles.results}>
        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>
            <DollarSign size={24} />
          </div>
          <div className={styles.resultContent}>
            <div className={styles.resultLabel}>Annual Savings</div>
            <div className={styles.resultValue}>
              €{savings.toLocaleString()}
            </div>
            <div className={styles.resultSubtext}>
              Current: €{annualCost.toLocaleString()} → PACKAGE.broker: €{packageBrokerCost.toLocaleString()}
            </div>
          </div>
        </div>

        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>
            <Clock size={24} />
          </div>
          <div className={styles.resultContent}>
            <div className={styles.resultLabel}>Setup Time</div>
            <div className={styles.resultValue}>{setupTime} minutes</div>
            <div className={styles.resultSubtext}>One-time setup</div>
          </div>
        </div>

        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>
            <TrendingDown size={24} />
          </div>
          <div className={styles.resultContent}>
            <div className={styles.resultLabel}>Maintenance</div>
            <div className={styles.resultValue}>{maintenanceHours} hours/year</div>
            <div className={styles.resultSubtext}>Ongoing maintenance</div>
          </div>
        </div>
      </div>

      {savings > 0 && (
        <div className={styles.savingsCta}>
          <p>
            Saving €{savings.toLocaleString()}/year? Consider sponsoring with just 10% of your savings.
          </p>
        </div>
      )}
    </div>
  );
}

