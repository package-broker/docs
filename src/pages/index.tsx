import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import Layout from '@theme/Layout';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import {ArrowRight, Boxes, Github, KeyRound, LockKeyhole, Network, Server} from 'lucide-react';
import ComparisonTable from '../components/ComparisonTable';
import FAQ from '../components/FAQ';
import {claims, faqItems, nodeCommands, pageDescription, pageTitle, releaseStatus, workersCommands} from '../data/landing';
import styles from './index.module.css';

const claimIcons = [LockKeyhole, Boxes, Server, Network, KeyRound];

export default function Home(): ReactNode {
  const brokenLinks = useBrokenLinks();
  ['quickstart', 'compare', 'comparison-unknown'].forEach(id => brokenLinks.collectAnchor(id));
  const canonical = useBaseUrl('/', {absolute: true});
  const socialImage = useBaseUrl('/img/og-2.0.png', {absolute: true});
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication', name: 'PACKAGE.broker',
        applicationCategory: 'DeveloperApplication', operatingSystem: 'Cloudflare Workers, Node.js',
        softwareVersion: '2.0 pre-release', license: 'https://www.gnu.org/licenses/agpl-3.0.html',
        description: pageDescription, url: canonical,
      },
      {'@type': 'WebSite', name: 'PACKAGE.broker', url: canonical, description: pageDescription},
      {
        '@type': 'FAQPage',
        mainEntity: faqItems.map(({question, answer}) => ({
          '@type': 'Question', name: question,
          acceptedAnswer: {'@type': 'Answer', text: answer},
        })),
      },
    ],
  };

  return (
    <Layout title={pageTitle} description={pageDescription}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="PACKAGE.broker 2.0: a Composer and npm registry with per-project isolation" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={socialImage} />
        <meta name="twitter:image:alt" content="PACKAGE.broker 2.0: a Composer and npm registry with per-project isolation" />
        <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>
      </Head>
      <main className={styles.landing}>
        <header className={styles.hero}>
          <div className={styles.container}>
            <p className={styles.status}>{releaseStatus}</p>
            <h1>Per-project isolation by SSO group, with upstream credentials kept per project</h1>
            <p className={styles.lede}>Package Broker is a Composer and npm registry you run yourself, on Cloudflare Workers or Docker. A developer in one client’s SSO group installs that client’s packages and nothing else. The client’s repo.magento.com keys and vendor tokens stay attached to that client’s project.</p>
            <div className={styles.actions}>
              <Link className={styles.primaryButton} to="#quickstart">Try the pre-release <ArrowRight size={18} aria-hidden="true" /></Link>
              <Link className={styles.secondaryButton} to="/docs/">Read the 2.0 docs</Link>
            </div>
            <section id="quickstart" aria-labelledby="quickstart-title" className={styles.quickstart}>
              <h2 id="quickstart-title">Start with your runtime</h2>
              <Tabs defaultValue="workers" aria-label="Quickstart runtime">
                <TabItem value="workers" label="Cloudflare Workers">
                  <p><strong>Requirements:</strong> Workers Paid plan, Node 24, pnpm.</p>
                  {/* Sources: origin/main README.md; packages/cli/src/cli.ts USAGE:31; commands/cloudflare/setup.ts. */}
                  <CodeBlock language="bash" title="Deploy from a source checkout">{workersCommands}</CodeBlock>
                  <p>Run in an interactive terminal. Follow the prompts and save the master key. Open the setup URL printed by the CLI to finish administrator enrollment.</p>
                  <Link to="/docs/getting-started/quickstart-cloudflare/">Full Workers quickstart <ArrowRight size={16} aria-hidden="true" /></Link>
                </TabItem>
                <TabItem value="node" label="Node / Docker">
                  <p><strong>Requirements:</strong> Node 24, pnpm, SQLite, filesystem or S3-compatible storage.</p>
                  {/* Sources: origin/main README.md; scripts/node-bundle-smoke.mjs; packages/runtime-node/src/entry.ts and startup.ts; cli.ts USAGE:28,39,40; docs/workers-install.md. */}
                  <CodeBlock language="bash" title="Run the Node bundle">{nodeCommands}</CodeBlock>
                  <p>The container image is planned for a release candidate. Until then these commands run the Node bundle directly. Keep the generated master key for subsequent starts and backups.</p>
                  <Link to="/docs/workers-install/">Finish administrator setup <ArrowRight size={16} aria-hidden="true" /></Link>
                </TabItem>
              </Tabs>
            </section>
          </div>
        </header>

        <section className={styles.section} aria-labelledby="claims-title">
          <div className={styles.container}>
            <h2 id="claims-title">What 2.0 does</h2>
            <p className={styles.sectionLede}>The accepted 2.0 decisions, in order. This is a pre-release; APIs and the plugin contract can still change.</p>
            <ol className={styles.claims}>
              {claims.map((claim, index) => {
                const Icon = claimIcons[index];
                return <li key={claim.title}>
                  <span className={styles.claimNumber} aria-hidden="true">0{index + 1}</span>
                  <Icon size={24} className={styles.claimIcon} aria-hidden="true" />
                  <div><h3>{claim.title}</h3><p>{claim.text}</p><Link to={claim.href}>{claim.label}</Link></div>
                </li>;
              })}
            </ol>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="architecture-title">
          <div className={styles.container}>
            <h2 id="architecture-title">How it works</h2>
            <p className={styles.sectionLede}>One core, two runtimes, with access checked at the project boundary.</p>
            <figure className={styles.architecture}>
              <svg viewBox="0 0 960 170" width="960" height="170" role="img" aria-labelledby="architecture-svg-title architecture-svg-desc">
                <title id="architecture-svg-title">Package requests pass through the project boundary</title>
                <desc id="architecture-svg-desc">Composer and npm clients send a token to Package Broker. Project grants select the packages and source credentials the request may use. The broker connects to the configured upstream sources.</desc>
                <defs><marker id="request-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>
                <g fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="10" y="30" width="235" height="110" rx="12" />
                  <rect x="330" y="10" width="300" height="150" rx="12" className={styles.brokerNode} />
                  <rect x="715" y="30" width="235" height="110" rx="12" />
                  <path d="M 250 85 H 320 M 640 85 H 705" markerEnd="url(#request-arrow)" />
                </g>
                <g fill="currentColor" textAnchor="middle" fontSize="20" fontFamily="system-ui, sans-serif">
                  <text x="127" y="77">Composer / npm</text><text x="127" y="107" fontSize="16">Client token</text>
                  <text x="480" y="58" fontWeight="700">PACKAGE.broker</text><text x="480" y="91" fontSize="16">Project grants + package subset</text><text x="480" y="121" fontSize="16">Project upstream credentials</text>
                  <text x="832" y="77">Upstream sources</text><text x="832" y="107" fontSize="16">Registries + repositories</text>
                </g>
              </svg>
              <figcaption>Composer or npm sends a token to a project URL. Package Broker checks scopes and grants, then serves that project’s package subset using the applicable source credentials. Workers stores state in D1, R2 and Queues; Node uses SQLite with filesystem or S3-compatible storage.</figcaption>
            </figure>
            <Link to="/docs/architecture/">Explore the architecture</Link>
          </div>
        </section>

        <section id="compare" className={styles.section} aria-labelledby="compare-title">
          <div className={styles.container}>
            <h2 id="compare-title">Compared with Satis, Private Packagist and Packeton</h2>
            <p className={styles.sectionLede}>Facts checked against each project’s own documentation. Missing documentation does not establish that a feature is absent.</p>
            <ul className={styles.fits}>
              <li><strong>Satis</strong> fits when a static Composer repository is enough and your web server handles access.</li>
              <li><strong>Private Packagist</strong> fits when you want a hosted service and your team already signs in through GitHub, GitLab or Bitbucket.</li>
              <li><strong>Packeton</strong> fits when you run PHP infrastructure and need LDAP sign-in or customer access limited by vendor and version.</li>
            </ul>
            <ComparisonTable />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="faq-title">
          <div className={styles.container}><h2 id="faq-title">Frequently asked questions</h2><FAQ items={faqItems} /></div>
        </section>

        <section className={styles.v1} aria-labelledby="v1-title">
          <div className={styles.container}>
            <h2 id="v1-title">Running v1?</h2>
            <p>Package Broker v1 still gets security fixes in <Link to="https://github.com/package-broker/server">package-broker/server</Link>. New features go into 2.0 only.</p>
            <p>2.0 is a rewrite in a new repository, package-broker/broker. It does not upgrade a v1 installation in place.</p>
            <Link to="/v1/">Read the v1 documentation</Link>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="contribute-title">
          <div className={styles.container}>
            <h2 id="contribute-title">Build with us</h2>
            <p>Review the code, try a source build, or contribute to the first 2.0 release candidate. Licensed under AGPL-3.0-only.</p>
            <Link className={styles.primaryButton} to="https://github.com/package-broker/broker"><Github size={20} aria-hidden="true" /> View PACKAGE.broker on GitHub</Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
