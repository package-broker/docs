import policy from './security-policy.json';
import {repository} from './landing';

export const productFile = (path: string) => `${repository}/blob/${policy.productCommit}/${path}`;
export const securityPolicyUrl = productFile('SECURITY.md');
export const privateReportingUrl = `${repository}/security/advisories/new`;
export type SecurityClaim = {
  id: string; status: 'shipped' | 'planned' | 'unknown'; text: string; sources: string[];
};
export const securityClaims: SecurityClaim[] = [
  {id: 'reporting', status: 'shipped', text: 'Report a vulnerability through GitHub private vulnerability reporting. Open the repository’s Security tab and choose Report a vulnerability. Do not open a public issue for a security problem. The policy promises an acknowledgement within five working days.', sources: ['SECURITY.md']},
  {id: 'report-details', status: 'shipped', text: 'Include the affected package and version or commit, the runtime (Cloudflare Workers or Node), steps to reproduce and the impact you see.', sources: ['SECURITY.md']},
  {id: 'report-scope', status: 'shipped', text: 'The repository, CLI, both runtimes, first-party plugins and generated build manifest are in scope. Third-party registries and findings requiring a compromised deployment master key or database write access are outside the policy’s scope.', sources: ['SECURITY.md']},
  {id: 'token-scopes', status: 'shipped', text: 'Token kinds identify the principal. Scopes are `read`, `write` and `full`. Scope checks and grants constrain each request; a token does not grant rights beyond its principal’s access.', sources: ['packages/core/src/authz/scope.ts', 'packages/core/src/authz/catalogue.ts', 'packages/core/src/authz/access-context.ts', 'packages/core/src/authz/token-use.ts']},
  {id: 'token-creation', status: 'shipped', text: 'Re-authentication is required before token creation. Revoking a token applies on the next request.', sources: ['packages/core/src/authz/pat-service.ts', 'packages/core/src/authz/service-token-service.ts', 'packages/core/src/authz/token-use.ts', 'packages/core/src/authz/token-revoke.ts']},
  {id: 'token-expiry', status: 'shipped', text: 'The operator configures maximum lifetimes separately for personal and service tokens. Both limits default to 365 days; the configurable ceilings are 365 days for personal tokens and 3,650 days for service tokens.', sources: ['packages/core/src/authz/token-lifetime.ts']},
  {id: 'audit-storage', status: 'shipped', text: 'Audit events are stored in the application database. Sealed rows form a SHA-256 hash chain; the API can list events and return the chain head. The chain can reveal changed rows when checked against a trusted head hash.', sources: ['packages/core/src/audit/chain.ts', 'packages/core/src/audit/sealer.ts', 'packages/core/src/api/routes/audit.ts', 'packages/db-sqlite/src/repositories/audit-pending.ts']},
  {id: 'audit-limit', status: 'shipped', text: 'An administrator with database write access can rewrite a chain. Retain head hashes outside the database when you need an independent comparison.', sources: ['docs/decisions/identity-and-sessions.md']},
  {id: 'workers-storage', status: 'shipped', text: 'On Cloudflare Workers, a deployment using D1 stores metadata there and a deployment using R2 stores artifacts there. Provisioning accepts a jurisdiction for D1 and R2 and checks it against existing resources. Choose storage placement when you create those resources.', sources: ['docs/decisions/platform-ports-and-adapters.md', 'packages/cli/src/commands/cloudflare/provision.ts']},
  {id: 'node-storage', status: 'shipped', text: 'On Node, you choose the host and persistent storage. For Docker, the application database uses the mounted data volume.', sources: ['Dockerfile', 'docs/decisions/deployment-and-runtimes.md']},
  {id: 'egress', status: 'shipped', text: 'Storage placement does not determine where requests to package sources or external services are processed. Assess storage and outbound requests separately.', sources: ['docs/security-and-residency.md', 'docs/decisions/registry-and-sources.md']},
  {id: 'maintainer', status: 'shipped', text: 'Package Broker has one maintainer during the pre-release phase. Governance records how decisions are made and how contributors become reviewers and maintainers.', sources: ['GOVERNANCE.md']},
  {id: 'release', status: 'shipped', text: 'Package Broker 2.0 has no tagged release yet. Reports against the `main` branch are accepted.', sources: ['SECURITY.md']},
  {id: 'customer-token', status: 'planned', text: 'Customer token issuance is not published on this page; the prefix is reserved.', sources: ['packages/core/src/secrets/token-format.ts', 'packages/core/src/authz/access-context.ts']},
  {id: 'audit-export', status: 'planned', text: 'CSV, JSON Lines export and an external audit sink are not published on this page.', sources: ['docs/decisions/identity-and-sessions.md', 'packages/core/src/api/routes/audit.ts']},
  {id: 'licence-wording', status: 'unknown', text: 'Legal-team licence wording awaits product-session confirmation and is omitted from this page.', sources: ['LICENSE', 'docs/decisions/licensing-and-contribution-terms.md']},
  {id: 'provenance-editions', status: 'unknown', text: 'Release provenance, SBOM and edition-gating statements are omitted pending the required publish check.', sources: ['SECURITY.md']},
];
export function publishedClaim(id: string): SecurityClaim {
  const claim = securityClaims.find(item => item.id === id);
  if (!claim || claim.status !== 'shipped') throw new Error(`Unpublished security claim: ${id}`);
  return claim;
}
export const tokenKinds = [
  {status: 'shipped' as const, prefix: 'pb_pat_', principal: 'A user', binding: 'Selected projects, or all projects allowed by the user’s grants', lifetime: 'Configured personal-token limit', sources: ['packages/core/src/authz/pat-service.ts', 'packages/core/src/authz/token-lifetime.ts']},
  {status: 'shipped' as const, prefix: 'pb_svc_', principal: 'A service principal', binding: 'One project; organization-wide creation requires organization administration rights', lifetime: 'Configured service-token limit', sources: ['packages/core/src/authz/service-principal-service.ts', 'packages/core/src/authz/service-token-service.ts', 'packages/core/src/authz/token-lifetime.ts']},
];
export const operatorResponsibilities = [
  {status: 'shipped' as const, area: 'Identity', provided: 'OIDC sign-in and grants to identity provider groups or e-mails', operator: 'Identity provider, groups, offboarding and multi-factor policy', sources: ['docs/decisions/identity-and-sessions.md']},
  {status: 'shipped' as const, area: 'Tokens', provided: 'Project binding, scopes, expiry and revocation', operator: 'Lifetime settings, CI secret storage and rotation, service principal grants', sources: ['packages/core/src/authz/service-token-service.ts', 'packages/core/src/authz/token-lifetime.ts']},
  {status: 'shipped' as const, area: 'Audit log', provided: 'Stored events and a sealed hash chain', operator: 'Retention and independent storage of head hashes', sources: ['packages/core/src/audit/chain.ts', 'docs/decisions/identity-and-sessions.md']},
  {status: 'shipped' as const, area: 'Data location', provided: 'D1 and R2 jurisdiction inputs during provisioning', operator: 'Cloudflare resources, storage placement, Node host and volumes', sources: ['packages/cli/src/commands/cloudflare/provision.ts', 'Dockerfile']},
  {status: 'shipped' as const, area: 'Deployment master key', provided: 'Encryption of source credentials using the deployment key', operator: 'Key storage, access, backup and rotation', sources: ['docs/decisions/secrets-and-tokens.md', 'docs/decisions/deployment-and-runtimes.md']},
  {status: 'shipped' as const, area: 'Backups and upgrades', provided: 'Self-hosted runtimes and an operations guide', operator: 'Taking and testing backups, applying updates and checking release notes', sources: ['docs/decisions/deployment-and-runtimes.md']},
  {status: 'shipped' as const, area: 'Network exposure', provided: 'Application access checks', operator: 'TLS, hostnames, firewall and any identity gateway policy', sources: ['packages/core/src/kernel/access.ts', 'docs/decisions/deployment-and-runtimes.md']},
];
