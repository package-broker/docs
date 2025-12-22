import { type ReactNode, useEffect, useState } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {
  ShieldCheck,
  Zap,
  Cloud,
  Check,
  Server,
  ArrowRight,
  TrendingDown,
  Github,
  Heart,
  Terminal,
  Copy
} from 'lucide-react';

import styles from './index.module.css';

function GitHubStarButton() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/lbajsarowicz/cloudflare-composer-proxy');
        if (res.ok) {
          const data = await res.json();
          setStars(data.stargazers_count);
        }
      } catch (e) {
        console.error('Failed to fetch stars', e);
      }
    };
    fetchStars();
  }, []);

  return (
    <Link
      className={clsx('button button--lg', styles.githubButton)}
      to="https://github.com/lbajsarowicz/cloudflare-composer-proxy">
      <Github size={20} />
      <span className="margin-left--sm">Star on GitHub</span>
      {stars !== null && (
        <span className="badge badge--secondary margin-left--sm" style={{ background: 'rgba(0,0,0,0.2)', color: 'inherit' }}>
          {stars}
        </span>
      )}
    </Link>
  );
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={styles.heroGlow} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row row--align-center">
          <div className="col col--6 text--left">
            <h1 className="hero__title">
              <span className={styles.heroTitleText}>
                {siteConfig.title}
              </span>
            </h1>
            <p className="hero__subtitle">{siteConfig.tagline}</p>
            <div className={styles.buttons}>
              <Link
                className="button button--primary button--lg"
                to="/docs/">
                Get Started
                <ArrowRight className="margin-left--sm" size={18} />
              </Link>
              <GitHubStarButton />
            </div>
            <div className="margin-top--lg">
              <span className="badge badge--secondary margin-right--sm">Zero Cost</span>
              <span className="badge badge--secondary margin-right--sm">Serverless</span>
              <span className="badge badge--secondary">SOC-2 Ready</span>
            </div>
          </div>
          <div className="col col--6">
            <div className="text--center">
              <img
                src="img/architecture-diagram.svg"
                alt="Architecture Diagram"
                className={styles.heroImage}
                style={{
                  width: '100%',
                  maxWidth: '550px',
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function TerminalWindow() {
  return (
    <div className={styles.terminalWindow}>
      <div className={styles.terminalHeader}>
        <div className={styles.terminalDot} style={{ background: '#ff5f56' }} />
        <div className={styles.terminalDot} style={{ background: '#ffbd2e' }} />
        <div className={styles.terminalDot} style={{ background: '#27c93f' }} />
      </div>
      <div className={styles.terminalBody}>
        <div className="margin-bottom--sm">
          <span className={styles.command}>$ composer config repositories.private composer https://pkg.my.org</span>
        </div>
        <div className="margin-bottom--sm">
          <span className={styles.command}>$ composer require my-org/premium-package</span>
        </div>
        <div className="margin-bottom--sm">
          <span className={styles.output}>./composer.json has been updated</span>
        </div>
        <div className="margin-bottom--sm">
          <span className={styles.output}>Running composer update my-org/premium-package</span>
        </div>
        <div className="margin-bottom--sm">
          <span className={styles.output}>Loading composer repositories with package information</span>
        </div>
        <div className="margin-bottom--sm">
          <span className={styles.output}>Updating dependencies</span>
        </div>
        <div>
          <span className={styles.success}>Lock file operations: 1 install, 0 updates, 0 removals</span>
        </div>
      </div>
    </div>
  );
}

function Feature({ title, description, icon }: { title: string, description: string, icon: ReactNode }) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>
          {icon}
        </div>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function PricingCard({
  title,
  price,
  comparison,
  savings,
  features,
  highlight = false
}: {
  title: string,
  price: string,
  comparison?: string,
  savings?: string,
  features: string[],
  highlight?: boolean
}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={clsx(styles.pricingCard, highlight && styles.highlight)}>
        <Heading as="h3">{title}</Heading>
        <div className={styles.priceTag}>{price}</div>
        {comparison && (
          <div className="margin-bottom--sm">
            <span className={styles.priceComparison}>{comparison}</span>
            {savings && <span className={styles.savingsTag}>Save {savings}</span>}
          </div>
        )}
        <ul className={styles.checkList}>
          {features.map((feature, idx) => (
            <li key={idx} className={styles.checkItem}>
              <Check className={styles.checkIcon} size={18} />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Minimalistic, SOC-2 Compatible Composer Mirror">
      <HomepageHeader />

      <main>
        {/* Value Proposition / Terminal Section */}
        <div className="container padding-vert--xl">
          <div className="row row--align-center">
            <div className="col col--5">
              <h2 className={styles.sectionTitle}>Works exactly like you expect.</h2>
              <p className="text--lg">
                Stop paying per-seat for private package hosting. Configure your proxy once, and use standard Composer commands forever.
              </p>
              <ul className={styles.checkList}>
                <li className={styles.checkItem}><Check className={styles.checkIcon} size={18} /> Zero build steps</li>
                <li className={styles.checkItem}><Check className={styles.checkIcon} size={18} /> Instant updates via Webhooks</li>
                <li className={styles.checkItem}><Check className={styles.checkIcon} size={18} /> Authenticated by Tokens</li>
              </ul>
            </div>
            <div className="col col--7">
              <TerminalWindow />
            </div>
          </div>
        </div>

        {/* Features Section - Reordered */}
        <div className={clsx('padding-vert--xl', styles.bentoSection)}>
          <div className="container">
            <div className="text--center margin-bottom--xl">
              <h2 className={styles.sectionTitle}>The "S.O.S." Strategy</h2>
              <p>Secure. Open. Serverless.</p>
            </div>
            <div className="row">
              <Feature
                icon={<Zap size={32} />}
                title="Zero Cost Core"
                description="Runs on top of Cloudflare Workers Free Tier. No hidden costs, no per-seat pricing."
              />
              <Feature
                icon={<Server size={32} />}
                title="Serverless Compatible"
                description="Deploy anywhere (Cloudflare, AWS, DigitalOcean) with zero infrastructure management overhead."
              />
              <Feature
                icon={<ShieldCheck size={32} />}
                title="SOC-2 Ready"
                description="Built with compliance in mind. Secure token-based access, encrypted credentials, and audit logging."
              />
            </div>
          </div>
        </div>

        {/* Cost Comparison Section */}
        <div className="container padding-vert--xl">
          <div className="text--center margin-bottom--xl">
            <h2 className={styles.sectionTitle}>Why pay for private packages?</h2>
            <p>Enterprise-grade features at a fraction of the cost.</p>
          </div>
          <div className="row">
            <PricingCard
              title="Commercial SaaS"
              price="€700+"
              features={[
                "Private Packages",
                "SaaS Hosting",
                "Standard Support",
                "Closed Source"
              ]}
            />
            <PricingCard
              title="Open Source Alternatives"
              price="€240+"
              comparison="vs Hosting"
              savings="~€240/yr"
              features={[
                "Self-Hosted Satis",
                "Manual Maintenance",
                "Server Costs",
                "Security Updates"
              ]}
            />
            <PricingCard
              title="PACKAGE.broker"
              price="€0"
              comparison="vs SaaS"
              savings="~€700/yr"
              highlight={true}
              features={[
                "Cloudflare Free Tier",
                "Unlimited Private Pkgs",
                "Global Edge Network",
                "SOC-2 Ready"
              ]}
            />
          </div>
        </div>

        {/* Community / Sponsor Section - Fixed Button */}
        <div className={styles.socialProof}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Sustainable Open Source</h2>
            <p className="margin-bottom--lg">
              PACKAGE.broker is free and open source. If it saves your company money, please consider supporting the development.
            </p>
            <div className={styles.buttons}>
              <Link
                className={styles.sponsorButton}
                to="https://github.com/sponsors/lbajsarowicz">
                <Heart className="margin-right--sm text--danger" size={18} fill="currentColor" />
                Sponsor Project
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
