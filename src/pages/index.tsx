import { type ReactNode, useEffect, useState } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {
  ShieldCheck,
  Zap,
  Check,
  Server,
  ArrowRight,
  Github,
} from 'lucide-react';

import styles from './index.module.css';
import CodeTabs from '../components/CodeTabs';
import CostCalculator from '../components/CostCalculator';
import PlatformGrid from '../components/PlatformGrid';
import SponsorShowcase from '../components/SponsorShowcase';
import ComparisonTable from '../components/ComparisonTable';
import InteractiveArchitecture from '../components/InteractiveArchitecture';

function GitHubStarButton() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/package-broker/server');
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
      to="https://github.com/package-broker/server">
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
      <div className={styles.heroNoise} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Layer 1: Headline Block */}
        <div className={styles.heroContent}>
          <h1 className={clsx('hero__title', styles.heroTitle)}>
            <span className={styles.heroTitleText}>
              Private Composer Packages.<br />
              Zero Per-Seat Pricing.
            </span>
          </h1>
          <p className={styles.heroSubtitle}>
            Stop paying €50-700/month. Deploy on Cloudflare Workers free tier or your infrastructure—zero per-seat fees.
          </p>
          <div className={styles.heroButtons}>
            <Link
              className="button button--primary button--lg"
              to="/docs/">
              Get Started
              <ArrowRight className="margin-left--sm" size={18} />
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/docs/installation/cloudflare">
              Deploy on Cloudflare
            </Link>
          </div>
          <div className={styles.heroProofChips}>
            <span className={styles.proofChip}>
              <Check size={14} className={styles.proofIcon} />
              Free tier
            </span>
            <span className={styles.proofChip}>
              <Check size={14} className={styles.proofIcon} />
              Token auth
            </span>
            <span className={styles.proofChip}>
              <Check size={14} className={styles.proofIcon} />
              Edge cache
            </span>
            <span className={styles.proofChip}>
              <Check size={14} className={styles.proofIcon} />
              Audit logs
            </span>
          </div>
        </div>

        {/* Layer 2: Visual Strip - Architecture Diagram in Glass Panel */}
        <div className={styles.heroVisualStrip}>
          <div className={styles.glassPanel}>
            <InteractiveArchitecture />
          </div>
          {/* Big Colorful Step Circles */}
          <div className={styles.heroStepsExplanation}>
            <div className={styles.heroStepItem}>
              <div className={styles.heroStepNumber}>①</div>
              <div className={styles.heroStepContent}>
                <h4 className={styles.heroStepTitle}>Request</h4>
                <p className={styles.heroStepDescription}>Composer requests a package from PACKAGE.broker</p>
              </div>
            </div>
            <div className={styles.heroStepItem}>
              <div className={styles.heroStepNumber}>②</div>
              <div className={styles.heroStepContent}>
                <h4 className={styles.heroStepTitle}>Cache Miss: Fetch & Store</h4>
                <p className={styles.heroStepDescription}>If not cached, fetch from source and store for future requests</p>
              </div>
            </div>
            <div className={styles.heroStepItem}>
              <div className={styles.heroStepNumber}>③</div>
              <div className={styles.heroStepContent}>
                <h4 className={styles.heroStepTitle}>Cache Hit: Serve Fast</h4>
                <p className={styles.heroStepDescription}>Serve from cache for instant package delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function TerminalWindow() {
  return (
    <CodeTabs
      tabs={[
        {
          label: 'Cloudflare Workers',
          content: `$ npx wrangler deploy

✨  Deploying to Cloudflare Workers
✓  Deployed successfully
→  https://package-broker.your-subdomain.workers.dev

$ composer config repositories.private composer \\
  https://package-broker.your-subdomain.workers.dev

$ composer require my-org/premium-package
✓  Package installed successfully`,
        },
        {
          label: 'Docker Setup (Coming Soon)',
          content: `# Status: Planned (Architecture Refactor in Progress)

$ docker run -d \\
  -p 8080:8080 \\
  -v $(pwd)/data:/data \\
  -e ENCRYPTION_KEY=$(openssl rand -base64 32) \\
  ghcr.io/package-broker/server:latest

✓  Container started
→  http://localhost:8080

$ composer config repositories.private composer \\
  http://localhost:8080

$ composer require my-org/premium-package
✓  Package installed successfully`,
        },
        {
          label: 'Kubernetes (Planned)',
          content: `# Status: Planned

$ helm repo add package-broker https://charts.package.broker
$ helm install my-broker package-broker/server \\
  --set storage.driver=s3 \\
  --set database.driver=postgres

✓  Deployed to Kubernetes
→  https://package-broker.your-domain.com

$ composer config repositories.private composer \\
  https://package-broker.your-domain.com

$ composer require my-org/premium-package
✓  Package installed successfully`,
        },
      ]}
    />
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

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PACKAGE.broker",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Linux, Docker, Cloudflare Workers",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "42"
    },
    "description": "Open source, SOC2-compliant Composer proxy for small agencies and enterprises. Self-hosted with Docker, Cloudflare Workers, or Kubernetes.",
    "url": "https://package.broker",
    "author": {
      "@type": "Person",
      "name": "Łukasz Bajsarowicz"
    }
  };

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Minimalistic, SOC-2 Compatible Composer Mirror">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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

        {/* Platform Deployment Showcase */}
        <div className="container padding-vert--xl">
          <div className="text--center margin-bottom--xl">
            <h2 className={styles.sectionTitle}>Deploy Anywhere</h2>
            <p>Choose the platform that fits your infrastructure</p>
          </div>
          <PlatformGrid />
        </div>

        {/* ROI Calculator Section */}
        <div id="calculate-savings" className="container padding-vert--xl">
          <div className="text--center margin-bottom--xl">
            <h2 className={styles.sectionTitle}>Calculate Your Savings</h2>
            <p>See how much you can save by switching to PACKAGE.broker</p>
          </div>
          <CostCalculator />
        </div>

        {/* Comparison Table */}
        <div className="container padding-vert--xl">
          <div className="text--center margin-bottom--xl">
            <h2 className={styles.sectionTitle}>Feature Comparison</h2>
            <p>See how PACKAGE.broker compares to other solutions</p>
          </div>
          <ComparisonTable summaryOnly={true} />
        </div>

        {/* Community / Sponsor Section */}
        <div className={styles.socialProof}>
          <div className="container">
            <SponsorShowcase />
          </div>
        </div>
      </main>
    </Layout>
  );
}
