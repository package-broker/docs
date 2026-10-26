import Link from '@docusaurus/Link';
import MarketingLayout, {PageSection} from '../components/marketing/MarketingLayout';
import {runtimes} from '../data/entity';
import {cloudflarePricing} from '../data/cloudflare-pricing';

export default function Pricing() {
  return <MarketingLayout title="What it costs" description="Plan Package Broker hosting and operations: no licence fee or per-user, per-project or per-client charge. Review Workers costs and your responsibilities.">
    <div className="pb-hero pb-hero--page"><p className="pb-eyebrow">Pricing</p><h1>What it costs</h1><p className="pb-hero__sub">No licence fee and no per-user, per-project or per-client charge. You pay for hosting and operations.</p></div>
    <PageSection id="software" title="No seat counting">
      <p>The software does not count or cap users. Package Broker is AGPL-3.0-only. Review the <Link className="pb-link" to="/docs/decisions/licensing-and-contribution-terms">licensing and contribution terms</Link>.</p>
    </PageSection>
    <PageSection id="hosting" title="Hosting and usage">
      <p>Run Package Broker on {runtimes}.</p>
      <p>From USD 5 a month on Workers Paid plus usage beyond the included requests and CPU time. D1, R2 and Queues are billed by usage. Check <a className="pb-link" href={cloudflarePricing.url}>Cloudflare Workers pricing</a> (checked <time dateTime={cloudflarePricing.checked}>{cloudflarePricing.checked}</time>) for current terms.</p>
      <p>On your own Node host, you pay for your host, storage and operations. Build the container image from the repository; container image publishing is planned.</p>
    </PageSection>
    <PageSection id="operations" title="What you run">
      <p>Workers deployments use Workers, D1, R2, Queues and Cron Triggers. Node deployments use the Node bundle, SQLite and a filesystem blob store, or an S3-compatible bucket.</p>
      <p>You own backups, master key recovery, upgrades and the identity provider. On Node, you also operate the host. Organization admins and the master key holder can use every client’s keys; rotate them when an admin leaves.</p>
      <p><Link className="pb-link" to="/security#operator">Security model and operator responsibilities</Link> · <Link className="pb-link" to="/agencies#cost">Costs for your agency</Link></p>
    </PageSection>
  </MarketingLayout>;
}
