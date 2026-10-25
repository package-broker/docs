import {useRef, useState, type KeyboardEvent} from 'react';
import Link from '@docusaurus/Link';
import {Copy} from 'lucide-react';
import {dockerCommands, dockerQuickstart, repository, workersCommands, workersQuickstart} from '../../data/landing';

const runtimes = [
  {id: 'workers', label: 'Workers', commands: workersCommands, href: workersQuickstart},
  {id: 'docker', label: 'Docker', commands: dockerCommands, href: dockerQuickstart},
];

export default function Quickstart() {
  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState({runtime: '', message: '', failed: false});
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const destinations: Record<string, number> = {ArrowRight: (index + 1) % 2, ArrowLeft: (index + 1) % 2, Home: 0, End: 1};
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
      <p>Choose a runtime. Start in a checkout of the broker repository with Node 24 and pnpm.</p>
      <p className="pb-legend"><span className="pb-badge pb-badge--warning">Pre-release</span> Build from source; no tagged release yet.</p>
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
            {runtime.id === 'workers' ? (
              <p>Needs the Workers Paid plan, with <code>CLOUDFLARE_ACCOUNT_ID</code> and <code>CLOUDFLARE_API_TOKEN</code> set in your environment. Use paths outside the checkout for the master key and setup token files; setup creates them for a new deployment.</p>
            ) : (
              <p>The Docker image is planned. Run the Node bundle on a host with persistent storage meanwhile. Generate a master key with <code>pnpm pb secrets generate-master-key</code> before starting.</p>
            )}
            <div className="pb-code">
              <div className="pb-code__bar"><span>Shell, {runtime.id === 'workers' ? 'Cloudflare Workers' : 'Node build for your host'}</span>
                <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" aria-label={`Copy ${runtime.label} commands`}
                  onClick={() => void copy(runtime)}><Copy className="pb-icon pb-icon--sm" aria-hidden="true"/><span>Copy</span></button>
              </div>
              <pre tabIndex={0} aria-label={`${runtime.label} commands`}><code>{runtime.commands}</code></pre>
            </div>
            <p className="pb-copy-status" role="status" aria-live="polite" aria-atomic="true"
              data-state={status.runtime === runtime.id && status.failed ? 'failed' : undefined}>
              {status.runtime === runtime.id ? status.message : ''}
            </p>
            <p>{runtime.id === 'workers' ? <>Open <code>/_pb/ui/setup</code> on your broker to finish administrator setup. </> : <>Keep the whole output directory, including assets and production dependencies. After starting, bootstrap the first administrator from your source checkout. </>}
              <Link className="pb-link" to={runtime.href}>{runtime.label} quickstart</Link>{runtime.id === 'docker' && <> · <Link className="pb-link" to="/docs/workers-install">First administrator setup</Link></>}</p>
          </div>
        ))}
      </div>
      <div className="pb-quickstart__cta">
        <Link className="pb-btn pb-btn--primary pb-btn--lg" to={runtimes[selected].href}>Read the full quickstart</Link>
        <a className="pb-btn pb-btn--lg" href={repository}>View the repository on GitHub</a>
      </div>
    </section>
  );
}
