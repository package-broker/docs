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
import ScreenshotGallery from '../components/ScreenshotGallery';
import AgencyUseCases from '../components/AgencyUseCases';
import FAQ from '../components/FAQ';

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
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="text--center">
          <h1 className="hero__title">
            <span className={styles.heroTitleText}>
              Ship Private Composer Packages Without Per-Seat Pricing
            </span>
          </h1>
          <p className="hero__subtitle">
            Stop paying €50-700/month for private package hosting. PACKAGE.broker runs on your infrastructure—or free Cloudflare Workers—with zero per-seat fees.
          </p>
          <div className={styles.buttons}>
            <Link
              className="button button--primary button--lg"
              to="/docs/">
              Get Started
              <ArrowRight className="margin-left--sm" size={18} />
            </Link>
            <GitHubStarButton />
          </div>
          <p className={styles.heroSubCta}>
            Runs on Cloudflare Workers free tier for small teams
          </p>
          <div className="margin-top--lg">
            <span className="badge badge--secondary margin-right--sm">Zero Cost</span>
            <span className="badge badge--secondary margin-right--sm">Serverless</span>
            <span className="badge badge--secondary">SOC-2 Ready</span>
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
        {/* Proof Bar - Screenshots */}
        <div className="container padding-vert--xl">
          <ScreenshotGallery />
        </div>

        {/* How It Works - Architecture Diagram */}
        <div className={clsx('padding-vert--xl', styles.architectureSection)}>
          <div className="container">
            <div className="text--center margin-bottom--lg">
              <h2 className={styles.sectionTitle}>How It Works</h2>
              <p>PACKAGE.broker sits between your Composer clients and package sources, caching artifacts for blazing-fast installs.</p>
            </div>
            <InteractiveArchitecture />
            {/* 3-Step Explanation */}
            <div className={styles.stepsExplanation}>
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>①</div>
                <div className={styles.stepContent}>
                  <h4 className={styles.stepTitle}>Request</h4>
                  <p className={styles.stepDescription}>Composer requests a package from PACKAGE.broker</p>
                </div>
              </div>
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>②</div>
                <div className={styles.stepContent}>
                  <h4 className={styles.stepTitle}>Cache Miss: Fetch & Store</h4>
                  <p className={styles.stepDescription}>If not cached, fetch from source and store for future requests</p>
                </div>
              </div>
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>③</div>
                <div className={styles.stepContent}>
                  <h4 className={styles.stepTitle}>Cache Hit: Serve Fast</h4>
                  <p className={styles.stepDescription}>Serve from cache for instant package delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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

        {/* Agency Use Cases */}
        <div className="container padding-vert--xl">
          <AgencyUseCases />
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
        <div className="container padding-vert--xl">
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
          <ComparisonTable />
        </div>

        {/* Community / Sponsor Section */}
        <div className={styles.socialProof}>
          <div className="container">
            <SponsorShowcase />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="container padding-vert--xl">
          <FAQ />
        </div>
      </main>
    </Layout>
  );
}
