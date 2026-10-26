import {useRef, useState, type KeyboardEvent} from 'react';
import Link from '@docusaurus/Link';
import {Copy} from 'lucide-react';
import {runtimes as runtimeOptions} from '../../data/entity';
import {dockerCommands, dockerQuickstart, dockerQuickstartPublished, releaseStatus, repository, workersCommands, workersQuickstartDoc, workersQuickstartPublished} from '../../data/landing';

const runtimes = [
  {id: 'workers', label: 'Cloudflare Workers', commands: workersCommands, href: workersQuickstartDoc, published: workersQuickstartPublished},
  {id: 'docker', label: 'Node host (Docker)', commands: dockerCommands, href: dockerQuickstart, published: dockerQuickstartPublished},
];

export default function Quickstart() {
  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState({runtime: '', message: '', failed: false});
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const destinations: Record<string, number> = {ArrowRight: (index + 1) % runtimes.length, ArrowLeft: (index - 1 + runtimes.length) % runtimes.length, Home: 0, End: runtimes.length - 1};
    const next = destinations[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }

  async function copy(runtime: typeof runtimes[number]) {
    setStatus({runtime: runtime.id, message: '', failed: false});
    try {
      await navigator.clipboard.writeText(runtime.commands);
      setStatus({runtime: runtime.id, message: 'Commands copied to the clipboard.', failed: false});
    } catch {
      setStatus({runtime: runtime.id, message: 'Copy failed. Select the commands and copy them manually.', failed: true});
    }
  }

  return (
    <section className="pb-quickstart" id="quickstart" aria-labelledby="qs-title">
      <h2 id="qs-title">Quickstart</h2>
      <p>Choose {runtimeOptions}, then clone the broker repository with the commands below.</p>
      <p className="pb-legend">{releaseStatus}. Build from source.</p>
      <div className="pb-tabs">
        <div role="tablist" aria-label="Runtime">
          {runtimes.map((runtime, index) => (
            <button key={runtime.id} type="button" role="tab" id={`tab-${runtime.id}`}
              ref={element => {tabs.current[index] = element;}}
              aria-selected={selected === index} aria-controls={`panel-${runtime.id}`}
              tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)}
              onKeyDown={event => onKeyDown(event, index)}>{runtime.label}</button>
          ))}
        </div>
        {runtimes.map((runtime, index) => (
          <div key={runtime.id} role="tabpanel" id={`panel-${runtime.id}`} aria-labelledby={`tab-${runtime.id}`}
            tabIndex={0} hidden={selected !== index}>
            <p><strong>Before you start:</strong></p>
            <ul>
              <li>Git, Node 24 or later, pnpm, PHP compatible with your package and Composer 2.</li>
              <li>A private Composer package and its vendor credentials.</li>
              {runtime.id === 'workers' ? <>
                <li>Workers Paid, Queues, R2 and Analytics Engine enabled; an account Workers subdomain registered in the dashboard.</li>
                <li>An account API token with Workers Scripts Edit, D1 Edit, Workers R2 Storage Edit, Queues Edit and Account Analytics Read permissions.</li>
              </> : <li>Docker Engine or Desktop with a running daemon and Linux container support.</li>}
            </ul>
            <p><Link className="pb-link" to={`${runtime.href}#what-you-need`}>{runtime.label} prerequisites</Link></p>
            {runtime.id === 'workers' ? (
              <p>Set <code>CLOUDFLARE_ACCOUNT_ID</code> and <code>CLOUDFLARE_API_TOKEN</code> in your environment. Use paths outside the checkout for the master key and setup token files; setup creates them for a new deployment.</p>
            ) : (
              <p>Container image publishing (GHCR) is planned; build the image from the repository. Generate a master key with <code>pnpm pb secrets generate-master-key</code> and store it for recovery before starting.</p>
            )}
            <div className="pb-code">
              <div className="pb-code__bar"><span>Shell, {runtime.id === 'workers' ? 'Cloudflare Workers' : 'Node host (Docker) build and run'}</span>
                <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" aria-label={`Copy ${runtime.label} commands`}
                  onClick={() => void copy(runtime)}><Copy className="pb-icon pb-icon--sm" aria-hidden="true"/><span>Copy</span></button>
              </div>
              <pre tabIndex={0} aria-label={`${runtime.label} commands`}><code>{runtime.commands}</code></pre>
            </div>
            <p className="pb-copy-status" role="status" aria-live="polite" aria-atomic="true"
              data-state={status.runtime === runtime.id && status.failed ? 'failed' : undefined}>
              {status.runtime === runtime.id ? status.message : ''}
            </p>
            <p>{runtime.id === 'workers' ? <>Open <code>/_pb/ui/setup</code> on your broker to finish administrator setup. </> : <>Wait for the broker to be ready, then bootstrap the first administrator inside the container. Open <code>/_pb/ui/setup</code> and paste the setup token from the terminal. Copy it now. You cannot see it again. </>}
              {runtime.published && <Link className="pb-link" to={runtime.href}>{runtime.label} quickstart</Link>}{runtime.id === 'docker' && <> <a className="pb-link" href={`${repository}/blob/main/Dockerfile`}>Dockerfile</a> · <a className="pb-link" href={`${repository}/blob/main/packages/cli/src/cli.ts`}>Administrator CLI reference</a></>}</p>
          </div>
        ))}
      </div>
      <div className="pb-quickstart__cta">
        {runtimes[selected].published && <Link className="pb-btn pb-btn--primary pb-btn--lg" to={runtimes[selected].href}>{runtimes[selected].label} quickstart</Link>}
        <a className="pb-btn pb-btn--lg" href={repository}>View the repository on GitHub</a>
      </div>
    </section>
  );
}
