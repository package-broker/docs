// Reviewed against local origin/main, 2026-10-26. Change only after reviewing product evidence.
// Evidence digests pin the reviewed source, not the site working tree. No network is required.
export const productRevision = "7596ccaeb9d9aa3bfa09f87c2bcc72d22857f15e";
export const productFacts = {
  "auth": {
    "value": "Personal and service tokens for Composer and npm.",
    "sourceUrl": "https://package.broker/docs/decisions/secrets-and-tokens",
    "quote": "One opaque token must work for Composer HTTP Basic and npm Bearer across npm, pnpm and yarn Berry;",
    "evidence": [
      "docs/decisions/secrets-and-tokens.md",
      "packages/core/src/auth/credential-parser.ts",
      "packages/core/src/auth/client-matrix.test.ts"
    ]
  },
  "isolation": {
    "value": "Separate projects and source credentials.",
    "sourceUrl": "https://package.broker/docs/decisions/registry-and-sources",
    "quote": "A source and its credentials can be owned by the organization",
    "evidence": [
      "docs/decisions/registry-and-sources.md",
      "packages/core/src/api/routes/sources.ts",
      "packages/core/src/registry/scoped-access.ts"
    ]
  },
  "npm": {
    "value": "Composer and npm use one token policy.",
    "sourceUrl": "https://package.broker/docs/decisions/secrets-and-tokens",
    "quote": "One opaque token must work for Composer HTTP Basic and npm Bearer across npm, pnpm and yarn Berry;",
    "evidence": [
      "docs/decisions/secrets-and-tokens.md",
      "packages/core/src/registry/composer/routes.ts",
      "packages/core/src/registry/npm/routes.ts",
      "packages/core/src/auth/client-matrix.test.ts"
    ]
  },
  "sso": {
    "value": "OIDC groups mapped to project grants.",
    "sourceUrl": "https://package.broker/docs/decisions/identity-and-sessions",
    "quote": "Single sign-on for the UI uses Cloudflare Access on Workers and Dex on Docker, both through OIDC",
    "evidence": [
      "docs/decisions/identity-and-sessions.md",
      "packages/plugin-sso-oidc/src/index.ts",
      "packages/core/src/authz/engine.ts"
    ]
  },
  "self-host": {
    "value": "Cloudflare Workers or Node. Build the container image from the repository; image publishing is planned.",
    "sourceUrl": "https://package.broker/docs/decisions/platform-ports-and-adapters",
    "quote": "Ship two runtimes, `runtime-cloudflare` and `runtime-node`, over one core.",
    "evidence": [
      "docs/decisions/platform-ports-and-adapters.md",
      "README.md",
      "Dockerfile"
    ]
  },
  "licence": {
    "value": "AGPL-3.0-only.",
    "sourceUrl": "https://package.broker/docs/decisions/licensing-and-contribution-terms",
    "quote": "AGPL-3.0-only",
    "evidence": [
      "docs/decisions/licensing-and-contribution-terms.md",
      "LICENSE",
      "README.md"
    ]
  },
  "price": {
    "planName": "Self-hosted",
    "priceSourceUrl": "https://package.broker/docs/decisions/platform-ports-and-adapters",
    "value": "Your Cloudflare plan or host, storage and operations.",
    "sourceUrl": "https://package.broker/docs/decisions/platform-ports-and-adapters",
    "quote": "The Workers Paid plan is a prerequisite.",
    "evidence": [
      "docs/decisions/platform-ports-and-adapters.md",
      "README.md",
      "LICENSE"
    ]
  }
};
export const evidenceDigests = {
  "Dockerfile": "79ba398dc803210ad647703fc3e7d8d2e5a2b97bf0a8f33c250a9202c619fcc2",
  "LICENSE": "0d96a4ff68ad6d4b6f1f30f713b18d5184912ba8dd389f86aa7710db079abcb0",
  "README.md": "78f856675f9f24a957558176c30ca4be08fad010847cf6cb3e71fcc7f270b809",
  "docs/decisions/identity-and-sessions.md": "050371a0daf5adb85ab7c14c5e9d178f0a62efa2379ddf58d57ce0ec4aab7a2a",
  "docs/decisions/licensing-and-contribution-terms.md": "1acf5eebd996366f79a0bbb9d52406a375f5deac19c3e63810d478b0a50392ff",
  "docs/decisions/platform-ports-and-adapters.md": "25bfb06eaa06a376bb3ee4b98edbfa2d2e2b2a9ea63b1f849661246e6284165c",
  "docs/decisions/registry-and-sources.md": "dab84ff47fa54c397fa7654e800fd168b18138c1585e42cfa28f71f8b14567f2",
  "docs/decisions/secrets-and-tokens.md": "863bb15742d4e372964141f3795ca616f18779a4f9123dd1c6ae23e549730361",
  "packages/core/src/api/routes/sources.ts": "5d7f0808a35c5102c52836596ca71ffd129cdad9ad876c7801f402cb5cd0ae5d",
  "packages/core/src/auth/client-matrix.test.ts": "91d8512d0beba34497ae028e09943d4346240bda12f362806bc758804d76e0e5",
  "packages/core/src/auth/credential-parser.ts": "7fe8bbfdaa16de9e92f9d3c7690a8dfcd6346d6b57e48335caa5bde3e18ceafe",
  "packages/core/src/authz/engine.ts": "fa66cc1d70c628bd5839fdcfb847a4823f9094e4c6ba78e343bf5c6d7d751663",
  "packages/core/src/registry/composer/routes.ts": "d62a05267518501df42bef1d10bae44fe5407aa65f4fb8a0cfd7eb611aa588b8",
  "packages/core/src/registry/npm/routes.ts": "4fe6b67e89d669df084c4533ada1518cf5b7ba5165953daa8fdb13fbe25c7d94",
  "packages/core/src/registry/scoped-access.ts": "c763ad764fcd74f0e189b71d5d66cd4d3c6d25949129e4233f3fa42a6d4bfd0c",
  "packages/plugin-sso-oidc/src/index.ts": "056286080d3404a7861bdc0646f8b801a52b185de5a82f5986725946ac3a19d6"
};
