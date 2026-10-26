export default function HowItWorks() {
  return (
<figure className="pb-diagram">
<svg width="900" height="340" role="img" aria-labelledby="diagram-title diagram-desc">
<title id="diagram-title">Package managers, tokens, projects and sources</title>
<desc id="diagram-desc">Composer and npm authenticate with a personal or service token. Identity provider groups grant project access. Each project selects sources with its own credentials.</desc>
<defs><symbol id="diagram-wide" viewBox="0 0 900 340">
        
        
        <defs><marker id="dg-w-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path className="pb-dg-arrow" d="M0 0 10 5 0 10z"/></marker></defs>

        <text className="pb-dg-label" x="0" y="112">Package managers</text>
        <text className="pb-dg-label" x="200" y="112">Token kinds</text>
        <text className="pb-dg-label" x="420" y="112">Projects in Package Broker</text>
        <text className="pb-dg-label" x="700" y="96">Sources</text>
        <text className="pb-dg-label" x="700" y="112">own credential per project</text>

        <rect className="pb-dg-node" x="420" y="28" width="210" height="52" rx="8"/>
        <text className="pb-dg-text" x="525" y="50" textAnchor="middle">Identity provider groups</text>
        <text className="pb-dg-mono" x="525" y="68" textAnchor="middle">client-a, client-b</text>
        <path className="pb-dg-edge" d="M618 80V120" markerEnd="url(#dg-w-arrow)"/>

        <rect className="pb-dg-broker" x="420" y="122" width="210" height="206" rx="12"/>

        <rect className="pb-dg-node" x="0" y="140" width="150" height="60" rx="8"/>
        <text className="pb-dg-text" x="75" y="164" textAnchor="middle">Composer</text>
        <text className="pb-dg-mono" x="75" y="184" textAnchor="middle">auth.json</text>
        <rect className="pb-dg-node" x="0" y="250" width="150" height="60" rx="8"/>
        <text className="pb-dg-text" x="75" y="274" textAnchor="middle">npm, pnpm, yarn</text>
        <text className="pb-dg-mono" x="75" y="294" textAnchor="middle">.npmrc</text>
        <path className="pb-dg-edge" d="M150 170H198" markerEnd="url(#dg-w-arrow)"/>
        <path className="pb-dg-edge" d="M150 280H198" markerEnd="url(#dg-w-arrow)"/>

        <rect className="pb-dg-group" x="200" y="128" width="170" height="186" rx="12"/>
        <rect className="pb-dg-node pb-dg-node--token" x="212" y="146" width="146" height="48" rx="8"/>
        <text className="pb-dg-mono" x="285" y="166" textAnchor="middle">pb_pat_</text>
        <text className="pb-dg-text" x="285" y="184" textAnchor="middle">developer</text>
        <rect className="pb-dg-node pb-dg-node--token" x="212" y="256" width="146" height="48" rx="8"/>
        <text className="pb-dg-mono" x="285" y="276" textAnchor="middle">pb_svc_</text>
        <text className="pb-dg-text" x="285" y="294" textAnchor="middle">CI token</text>
        <path className="pb-dg-edge" d="M358 170H438" markerEnd="url(#dg-w-arrow)"/>
        <path className="pb-dg-edge" d="M358 280H438" markerEnd="url(#dg-w-arrow)"/>

        <rect className="pb-dg-node" x="440" y="140" width="170" height="60" rx="8"/>
        <text className="pb-dg-text" x="525" y="164" textAnchor="middle">Project</text>
        <text className="pb-dg-mono" x="525" y="184" textAnchor="middle">client-a</text>
        <rect className="pb-dg-node" x="440" y="250" width="170" height="60" rx="8"/>
        <text className="pb-dg-text" x="525" y="274" textAnchor="middle">Project</text>
        <text className="pb-dg-mono" x="525" y="294" textAnchor="middle">client-b</text>
        <path className="pb-dg-edge" d="M610 170H698" markerEnd="url(#dg-w-arrow)"/>
        <path className="pb-dg-edge" d="M610 280H698" markerEnd="url(#dg-w-arrow)"/>

        <rect className="pb-dg-node" x="700" y="140" width="200" height="60" rx="8"/>
        <text className="pb-dg-text" x="800" y="164" textAnchor="middle">Git URL</text>
        <text className="pb-dg-mono" x="800" y="184" textAnchor="middle">credential: client-a</text>
        <rect className="pb-dg-node" x="700" y="250" width="200" height="60" rx="8"/>
        <text className="pb-dg-mono" x="800" y="274" textAnchor="middle">repo.magento.com</text>
        <text className="pb-dg-mono" x="800" y="294" textAnchor="middle">credential: client-b</text>
      </symbol><symbol id="diagram-narrow" viewBox="0 0 280 336">
        
        
        <defs><marker id="dg-n-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path className="pb-dg-arrow" d="M0 0 10 5 0 10z"/></marker></defs>

        <rect className="pb-dg-node" x="0" y="0" width="130" height="44" rx="8"/>
        <text className="pb-dg-text" x="65" y="27" textAnchor="middle">Composer</text>
        <rect className="pb-dg-node" x="150" y="0" width="130" height="44" rx="8"/>
        <text className="pb-dg-text" x="215" y="27" textAnchor="middle">npm, pnpm, yarn</text>
        <path className="pb-dg-edge" d="M65 44V72" markerEnd="url(#dg-n-arrow)"/>
        <path className="pb-dg-edge" d="M215 44V72" markerEnd="url(#dg-n-arrow)"/>

        <rect className="pb-dg-node pb-dg-node--token" x="0" y="76" width="130" height="56" rx="8"/>
        <text className="pb-dg-mono" x="65" y="99" textAnchor="middle">pb_pat_</text>
        <text className="pb-dg-text" x="65" y="119" textAnchor="middle">developer</text>
        <rect className="pb-dg-node pb-dg-node--token" x="150" y="76" width="130" height="56" rx="8"/>
        <text className="pb-dg-mono" x="215" y="99" textAnchor="middle">pb_svc_</text>
        <text className="pb-dg-text" x="215" y="119" textAnchor="middle">CI token</text>

        <path className="pb-dg-edge" d="M65 132V148M215 132V148M65 148H215"/>
        <path className="pb-dg-edge" d="M65 148V172" markerEnd="url(#dg-n-arrow)"/>

        <rect className="pb-dg-node pb-dg-node--brand" x="0" y="176" width="130" height="64" rx="8"/>
        <text className="pb-dg-text" x="65" y="197" textAnchor="middle">Projects</text>
        <text className="pb-dg-mono" x="65" y="215" textAnchor="middle">client-a</text>
        <text className="pb-dg-mono" x="65" y="231" textAnchor="middle">client-b</text>
        <rect className="pb-dg-node" x="150" y="176" width="130" height="64" rx="8"/>
        <text className="pb-dg-text" x="215" y="201" textAnchor="middle">Identity provider</text>
        <text className="pb-dg-text" x="215" y="221" textAnchor="middle">groups</text>
        <path className="pb-dg-edge" d="M150 208H134" markerEnd="url(#dg-n-arrow)"/>

        <path className="pb-dg-edge" d="M65 240V268" markerEnd="url(#dg-n-arrow)"/>
        <rect className="pb-dg-node" x="0" y="272" width="280" height="64" rx="8"/>
        <text className="pb-dg-text" x="140" y="293" textAnchor="middle">Sources</text>
        <text className="pb-dg-mono" x="140" y="311" textAnchor="middle">Git URL, repo.magento.com</text>
        <text className="pb-dg-text" x="140" y="328" textAnchor="middle">own credential per project</text>
      </symbol></defs>
<use href="#diagram-wide" className="pb-diagram__wide" width="100%" height="100%"/>
<use href="#diagram-narrow" className="pb-diagram__narrow" width="100%" height="100%"/>
</svg>
<figcaption>Arrows follow package requests from package managers through tokens and projects to sources. Identity provider groups grant project access. Prefixes identify personal (<code>pb_pat_</code>) and service (<code>pb_svc_</code>) tokens.</figcaption>
</figure>
  );
}
