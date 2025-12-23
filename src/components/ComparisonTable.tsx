import React, { useState, useRef, useEffect } from 'react';
import { Check, X, AlertCircle, Info, ExternalLink } from 'lucide-react';
import comparisonData from '../data/comparison.json';
import styles from './ComparisonTable.module.css';

interface Citation {
  label: string;
  url: string;
}

interface FeatureValue {
  value: boolean | string;
  citations?: Citation[];
}

interface ComparisonData {
  lastVerified: string;
  products: Array<{
    id: string;
    name: string;
    trademarkSuffix: string;
    category: string;
  }>;
  featureGroups: Array<{
    id: string;
    label: string;
  }>;
  features: Array<{
    id: string;
    label: string;
    group: string;
    type: string;
    summary: boolean;
  }>;
  values: Array<{
    featureId: string;
    [productId: string]: FeatureValue | string;
  }>;
}

const data = comparisonData as ComparisonData;

function renderValue(value: boolean | string, type: string): React.ReactNode {
  if (type === 'boolean') {
    if (value === true) {
      return <Check className={styles.checkIcon} size={18} />;
    } else if (value === false) {
      return <X className={styles.xIcon} size={18} />;
    } else {
      return <AlertCircle className={styles.unknownIcon} size={18} />;
    }
  }
  
  if (typeof value === 'string') {
    if (value === 'Unknown' || value.toLowerCase().includes('unknown')) {
      return <span className={styles.unknownText}>{value}</span>;
    }
    return <span>{value}</span>;
  }
  
  return <span>{String(value)}</span>;
}

interface ComparisonTableProps {
  summaryOnly?: boolean;
  showCitations?: boolean;
  enableCompetitorSelector?: boolean;
  defaultSelectedCompetitors?: string[];
  maxSelectedCompetitors?: number;
}

export default function ComparisonTable({ 
  summaryOnly = false, 
  showCitations = false,
  enableCompetitorSelector = false,
  defaultSelectedCompetitors = ['private-packagist', 'satis', 'gitlab'],
  maxSelectedCompetitors = 5
}: ComparisonTableProps) {
  const [showCitationsState, setShowCitationsState] = useState(showCitations);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>(
    enableCompetitorSelector ? defaultSelectedCompetitors : []
  );
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ left: false, right: false });

  // Handle scroll indicators
  useEffect(() => {
    const wrapper = tableWrapperRef.current;
    if (!wrapper) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = wrapper;
      setScrollState({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 1
      });
    };

    updateScrollState();
    wrapper.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);

    return () => {
      wrapper.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [selectedCompetitors.length, summaryOnly]); // Re-run when products or view changes

  const featuresToShow = summaryOnly
    ? data.features.filter(f => f.summary)
    : data.features;

  const getValue = (featureId: string, productId: string): FeatureValue | null => {
    const featureValues = data.values.find(v => v.featureId === featureId);
    if (!featureValues) return null;
    const value = featureValues[productId] as FeatureValue | undefined;
    return value || null;
  };

  // Filter and order products: always show package-broker first, then selected competitors
  const packageBroker = data.products.find(p => p.id === 'package-broker');
  const competitorProducts = enableCompetitorSelector && !summaryOnly
    ? data.products
        .filter(p => p.id !== 'package-broker' && selectedCompetitors.includes(p.id))
        .sort((a, b) => {
          const aIndex = selectedCompetitors.indexOf(a.id);
          const bIndex = selectedCompetitors.indexOf(b.id);
          return aIndex - bIndex;
        })
    : data.products.filter(p => p.id !== 'package-broker');
  
  const displayedProducts = packageBroker 
    ? [packageBroker, ...competitorProducts]
    : competitorProducts;

  const handleCompetitorToggle = (productId: string) => {
    setSelectedCompetitors(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else if (prev.length < maxSelectedCompetitors) {
        return [...prev, productId];
      }
      return prev;
    });
  };

  const availableCompetitors = data.products.filter(p => p.id !== 'package-broker');

  const groupedFeatures = featuresToShow.reduce((acc, feature) => {
    const group = data.featureGroups.find(g => g.id === feature.group);
    const groupId = group?.id || 'other';
    if (!acc[groupId]) {
      acc[groupId] = {
        group: group || { id: groupId, label: 'Other' },
        features: []
      };
    }
    acc[groupId].features.push(feature);
    return acc;
  }, {} as Record<string, { group: { id: string; label: string }; features: typeof data.features }>);

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        {!summaryOnly && (
          <div className={styles.tableHeaderTop}>
            <h3 className={styles.tableTitle}>Feature Comparison</h3>
            <div className={styles.tableControls}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={showCitationsState}
                  onChange={(e) => setShowCitationsState(e.target.checked)}
                  className={styles.toggleInput}
                />
                <span>Show citations</span>
              </label>
            </div>
          </div>
        )}
        {enableCompetitorSelector && !summaryOnly && (
          <div className={styles.competitorSelector}>
            <label className={styles.selectorLabel}>Compare with:</label>
            <div className={styles.selectorCheckboxes}>
              {availableCompetitors.map(product => (
                <label key={product.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedCompetitors.includes(product.id)}
                    onChange={() => handleCompetitorToggle(product.id)}
                    disabled={!selectedCompetitors.includes(product.id) && selectedCompetitors.length >= maxSelectedCompetitors}
                    className={styles.checkboxInput}
                  />
                  <span>{product.name}{product.trademarkSuffix}</span>
                </label>
              ))}
            </div>
            {selectedCompetitors.length >= maxSelectedCompetitors && (
              <p className={styles.selectorHint}>
                Maximum {maxSelectedCompetitors} competitors selected. Deselect one to add another.
              </p>
            )}
          </div>
        )}
        <p className={styles.lastVerified}>
          Last verified: {new Date(data.lastVerified).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      
      <div 
        ref={tableWrapperRef}
        className={`${styles.tableWrapper} ${scrollState.left ? styles.scrollableLeft : ''} ${scrollState.right ? styles.scrollableRight : ''}`}
      >
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th className={styles.featureColumn}>Feature</th>
              {displayedProducts.map(product => (
                <th
                  key={product.id}
                  className={product.id === 'package-broker' ? styles.highlightColumn : ''}
                >
                  {product.name}{product.trademarkSuffix}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.values(groupedFeatures).map(({ group, features }) => (
              <React.Fragment key={group.id}>
                {!summaryOnly && (
                  <tr className={styles.groupHeader}>
                    <td colSpan={displayedProducts.length + 1} className={styles.groupCell}>
                      {group.label}
                    </td>
                  </tr>
                )}
                {features.map(feature => (
                  <tr key={feature.id}>
                    <td className={styles.featureCell}>
                      {feature.label}
                      {!summaryOnly && showCitationsState && (
                        <span className={styles.citationIndicator}>
                          <Info size={12} />
                        </span>
                      )}
                    </td>
                    {displayedProducts.map(product => {
                      const valueData = getValue(feature.id, product.id);
                      const value = valueData?.value ?? 'Unknown';
                      const citations = valueData?.citations || [];

                      return (
                        <td
                          key={product.id}
                          className={product.id === 'package-broker' ? styles.highlightCell : ''}
                        >
                          <div className={styles.cellContent}>
                            {renderValue(value, feature.type)}
                            {!summaryOnly && showCitationsState && citations.length > 0 && (
                              <div className={styles.citations}>
                                {citations.map((citation, idx) => (
                                  <a
                                    key={idx}
                                    href={citation.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.citationLink}
                                  >
                                    {citation.label}
                                    <ExternalLink size={10} />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
              </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.tableFooter}>
        {!summaryOnly && (
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <Check className={styles.checkIcon} size={16} />
              <span>Supported</span>
            </div>
            <div className={styles.legendItem}>
              <X className={styles.xIcon} size={16} />
              <span>Not supported</span>
            </div>
            <div className={styles.legendItem}>
              <AlertCircle className={styles.unknownIcon} size={16} />
              <span>Unknown / Not verified</span>
            </div>
          </div>
        )}
      <p className={styles.disclaimer}>
          All trademarks are property of their respective owners. This project is not affiliated with, endorsed by, or sponsored by any third-party services. See{' '}
          <a href="/docs/migration/legal-notice" className={styles.legalLink}>
            Legal Notice
          </a>{' '}
          for details.
        </p>
        {summaryOnly && (
          <p className={styles.fullComparisonLink}>
            <a href="/docs/comparison" className={styles.fullLink}>
              View full comparison matrix →
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
