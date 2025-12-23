import Link from '@docusaurus/Link';
import { Check, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import styles from './SponsorShowcase.module.css';

interface Tier {
  name: string;
  monthlyUsd: number;
  features: string[];
  highlight?: boolean;
}

const tiers: Tier[] = [
  {
    name: 'Individual',
    monthlyUsd: 5,
    features: [
      'Name in README',
      'Community Discord access',
      'Early feature access',
    ],
  },
  {
    name: 'Agency',
    monthlyUsd: 25,
    features: [
      'Logo placement on website (with backlink)',
      'Prioritized attention to issues you report',
      'Migration help for client projects',
      'Direct maintainer contact via GitHub Discussions',
    ],
    highlight: true,
  },
  {
    name: 'Enterprise',
    monthlyUsd: 250,
    features: [
      'Priority support channel (GitHub)',
      'Roadmap input & custom requests',
      'Security & compliance collaboration',
      'Onboarding for your team',
    ],
  },
];

export default function SponsorShowcase() {
  const [billingView, setBillingView] = useState<'monthly' | 'annual'>('monthly');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const displayTiers = useMemo(() => {
    return tiers.map((tier) => {
      const annualEquivalent = tier.monthlyUsd * 12;
      const price =
        billingView === 'monthly'
          ? `$${tier.monthlyUsd}/mo`
          : `$${annualEquivalent}/yr`;

      const priceSubtext =
        billingView === 'annual'
          ? 'Annual equivalent for budgeting (GitHub Sponsors bills monthly)'
          : undefined;

      return { ...tier, price, priceSubtext };
    });
  }, [billingView]);

  return (
    <div className={styles.sponsorShowcase}>
      <h2 className={styles.title}>Support Sustainable Open Source</h2>
      <p className={styles.subtitle}>
        PACKAGE.broker is free and open source. If it saves your agency time (and money), please consider sponsoring ongoing maintenance, security, and support.
      </p>

      <div className={styles.billingRow} aria-label="Choose billing view">
        <div className={styles.billingToggle} role="tablist" aria-label="Billing view">
          <button
            type="button"
            className={`${styles.billingButton} ${billingView === 'monthly' ? styles.billingButtonActive : ''}`}
            onClick={() => setBillingView('monthly')}
            role="tab"
            aria-selected={billingView === 'monthly'}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`${styles.billingButton} ${billingView === 'annual' ? styles.billingButtonActive : ''}`}
            onClick={() => setBillingView('annual')}
            role="tab"
            aria-selected={billingView === 'annual'}
          >
            Annual equivalent
          </button>
        </div>
      </div>
      
      <div className={styles.tiers}>
        {displayTiers.map((tier, idx) => (
          <div
            key={idx}
            className={`${styles.tierCard} ${tier.highlight ? styles.highlight : ''}`}
          >
            {tier.highlight && (
              <div className={styles.popularBadge}>Most Popular</div>
            )}
            <h3 className={styles.tierName}>{tier.name}</h3>
            <div className={styles.tierPriceBlock}>
              <div className={styles.tierPrice}>{tier.price}</div>
              {tier.priceSubtext && (
                <div className={styles.tierPriceSub}>{tier.priceSubtext}</div>
              )}
            </div>
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
              target="_blank"
              rel="noopener noreferrer"
            >
              Sponsor on GitHub
            </Link>
          </div>
        ))}
      </div>

      <div className={styles.cta}>
        <p className={styles.ctaText}>
          <strong>Saved €700/year?</strong> Sponsor with 10% of your savings (€70/year).
        </p>
        <p className={styles.ctaSubtext}>
          Your team’s coffee budget → Sustainable open source
        </p>
        <p className={styles.ctaLinks}>
          <button
            type="button"
            className={styles.inlineLink}
            onClick={() => {
              // Avoid href="#..." to prevent Docusaurus broken-anchor warnings during build.
              // Still provides the same UX on the homepage.
              if (typeof document === 'undefined') return;
              const el = document.getElementById('calculate-savings');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else if (typeof window !== 'undefined') {
                window.location.hash = 'calculate-savings';
              }
            }}
          >
            Calculate your savings
          </button>
          <span className={styles.ctaLinkDivider} aria-hidden="true">·</span>
          <Link
            to="https://github.com/package-broker/server/discussions"
            className={styles.inlineLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Questions? Start a GitHub Discussion
          </Link>
        </p>
      </div>

      <div className={styles.sponsorFaq}>
        <h3 className={styles.sponsorFaqTitle}>Sponsoring FAQ</h3>
        <div className={styles.sponsorFaqList}>
          <div
            className={`${styles.sponsorFaqItem} ${openFaqIndex === 0 ? styles.open : ''}`}
          >
            <button
              className={styles.sponsorFaqQuestion}
              onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
              aria-expanded={openFaqIndex === 0}
            >
              <span className={styles.questionText}>How does billing work?</span>
              <ChevronDown
                className={`${styles.chevron} ${openFaqIndex === 0 ? styles.rotated : ''}`}
                size={20}
              />
            </button>
            <div className={styles.sponsorFaqAnswer}>
              <p>GitHub Sponsors handles billing. Pick a tier and manage it from your GitHub account.</p>
            </div>
          </div>
          <div
            className={`${styles.sponsorFaqItem} ${openFaqIndex === 1 ? styles.open : ''}`}
          >
            <button
              className={styles.sponsorFaqQuestion}
              onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
              aria-expanded={openFaqIndex === 1}
            >
              <span className={styles.questionText}>Can I sponsor on behalf of a client?</span>
              <ChevronDown
                className={`${styles.chevron} ${openFaqIndex === 1 ? styles.rotated : ''}`}
                size={20}
              />
            </button>
            <div className={styles.sponsorFaqAnswer}>
              <p>Yes — many agencies sponsor from their company account (or a client org) while using PACKAGE.broker across multiple projects.</p>
            </div>
          </div>
          <div
            className={`${styles.sponsorFaqItem} ${openFaqIndex === 2 ? styles.open : ''}`}
          >
            <button
              className={styles.sponsorFaqQuestion}
              onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
              aria-expanded={openFaqIndex === 2}
            >
              <span className={styles.questionText}>What does "priority" mean?</span>
              <ChevronDown
                className={`${styles.chevron} ${openFaqIndex === 2 ? styles.rotated : ''}`}
                size={20}
              />
            </button>
            <div className={styles.sponsorFaqAnswer}>
              <p>Sponsored issues and questions are prioritized over non-sponsored requests, but there are no guaranteed response times.</p>
            </div>
          </div>
          <div
            className={`${styles.sponsorFaqItem} ${openFaqIndex === 3 ? styles.open : ''}`}
          >
            <button
              className={styles.sponsorFaqQuestion}
              onClick={() => setOpenFaqIndex(openFaqIndex === 3 ? null : 3)}
              aria-expanded={openFaqIndex === 3}
            >
              <span className={styles.questionText}>Where does the money go?</span>
              <ChevronDown
                className={`${styles.chevron} ${openFaqIndex === 3 ? styles.rotated : ''}`}
                size={20}
              />
            </button>
            <div className={styles.sponsorFaqAnswer}>
              <p>Maintaining releases, security work, and improving documentation, migrations, and operational reliability.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

