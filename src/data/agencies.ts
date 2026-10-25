export const accessModel = '/docs/reference/access-model';
export const vendorSources = '/docs/guides/mirror-vendor-repositories';
export const sourceDecision = '/docs/decisions/registry-and-sources';
export const identityDecision = '/docs/decisions/identity-and-sessions';
export const tokenDecision = '/docs/decisions/secrets-and-tokens';
export const agency = {
  organization: 'example-agency',
  sourceHost: 'repo.magento.com',
  clients: [
    {client: 'Client A', project: 'acme', source: 'acme-magento', credential: 'A', group: 'acme-devs', package: 'vendor/acme-extension'},
    {client: 'Client B', project: 'globex', source: 'globex-magento', credential: 'B', group: 'globex-devs', package: 'vendor/globex-extension'},
    {client: 'Client C', project: 'initech', source: 'initech-magento', credential: 'C', group: 'initech-devs', package: 'vendor/initech-extension'},
  ],
} as const;
