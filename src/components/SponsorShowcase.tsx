import Link from '@docusaurus/Link';
import { Heart, Check } from 'lucide-react';
import styles from './SponsorShowcase.module.css';

interface Tier {
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
}

const tiers: Tier[] = [
  {
    name: 'Individual',
    price: '$5/mo',
    features: [
      'Name in README',
      'Community Discord access',
      'Early feature access',
    ],
  },
  {
    name: 'Agency',
    price: '$25/mo',
    features: [
      'Logo on website',
      'Priority bug fixes',
      'Migration support',
      'Direct email support',
    ],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$250/mo',
    features: [
      'Private support channel',
      'Custom feature requests',
      'SLA agreement',
      'Dedicated onboarding',
    ],
  },
];

export default function SponsorShowcase() {
  return (
    <div className={styles.sponsorShowcase}>
      <h2 className={styles.title}>Support Sustainable Open Source</h2>
      <p className={styles.subtitle}>
        PACKAGE.broker is free and open source. If it saves your company money, please consider supporting the development.
      </p>
      
      <div className={styles.tiers}>
        {tiers.map((tier, idx) => (
          <div
            key={idx}
            className={`${styles.tierCard} ${tier.highlight ? styles.highlight : ''}`}
          >
            {tier.highlight && (
              <div className={styles.popularBadge}>Most Popular</div>
            )}
            <h3 className={styles.tierName}>{tier.name}</h3>
            <div className={styles.tierPrice}>{tier.price}</div>
            <ul className={styles.tierFeatures}>
              {tier.features.map((feature, fIdx) => (
                <li key={fIdx} className={styles.tierFeature}>
                  <Check className={styles.checkIcon} size={18} />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to="https://github.com/sponsors/lbajsarowicz"
              className={styles.sponsorButton}
            >
              <Heart className={styles.heartIcon} size={18} fill="currentColor" />
              Sponsor Now
            </Link>
          </div>
        ))}
      </div>

      <div className={styles.cta}>
        <p className={styles.ctaText}>
          <strong>Saved €700/year?</strong> Sponsor with just 10% of your savings.
        </p>
        <p className={styles.ctaSubtext}>
          Your team's coffee budget = Sustainable open source
        </p>
      </div>
    </div>
  );
}

