import {CircleCheck, Hourglass} from 'lucide-react';
import {useId} from 'react';
import clsx from 'clsx';
import styles from './OutageFlow.module.css';

function Markers({id}: {id: string}) {
  return (
    <defs>
      <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path className="pb-dg-arrow" d="M0 0 10 5 0 10z" /></marker>
      <marker id={`${id}-ok`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path className={styles.arrowOk} d="M0 0 10 5 0 10z" /></marker>
    </defs>
  );
}

function Cylinder({cx, top, rx, height}: {cx: number; top: number; rx: number; height: number}) {
  const ry = 12;
  const bottom = top + height;
  return (
    <g>
      <path className={styles.cyl} d={`M${cx - rx} ${top}V${bottom}A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom}V${top}`} />
      <ellipse className={styles.cylTop} cx={cx} cy={top} rx={rx} ry={ry} />
    </g>
  );
}

function Break({x, y}: {x: number; y: number}) {
  return (
    <g>
      <circle className={styles.breakDot} cx={x} cy={y} r="9" />
      <path className={styles.breakX} d={`M${x - 3.5} ${y - 3.5}l7 7m0-7-7 7`} />
    </g>
  );
}

function WideDiagram() {
  return (
    <svg className={styles.wide} viewBox="0 0 652 270" aria-hidden="true" focusable="false">
      <Markers id="of-w" />
      <text className="pb-dg-label" x="0" y="24">Your CI</text>
      <text className="pb-dg-label" x="652" y="24" textAnchor="end">Vendor repositories</text>

      <rect className="pb-dg-node" x="0" y="105" width="140" height="80" rx="8" />
      <text className="pb-dg-text" x="70" y="138" textAnchor="middle">CI pipeline</text>
      <text className={clsx('pb-dg-mono', styles.small)} x="70" y="159" textAnchor="middle">composer install</text>

      <path className="pb-dg-edge" d="M140 128H247" markerEnd="url(#of-w-arrow)" />
      <text className={clsx('pb-dg-mono', styles.small)} x="175" y="119" textAnchor="middle">pb_svc_</text>
      <path className={styles.edgeOk} d="M249 162H142" markerEnd="url(#of-w-ok)" />
      <text className={clsx('pb-dg-mono', styles.small, styles.okText)} x="175" y="181" textAnchor="middle">200</text>

      <g transform="translate(12 0)">
        <rect className="pb-dg-broker" x="198" y="40" width="250" height="220" rx="12" />
        <text className={clsx('pb-dg-text', styles.title)} x="323" y="68" textAnchor="middle">Package Broker</text>
        <Cylinder cx={323} top={98} rx={86} height={92} />
        <text className={clsx('pb-dg-text', styles.title)} x="323" y="148" textAnchor="middle">Stored archives</text>
        <text className={clsx('pb-dg-text', styles.muted)} x="323" y="168" textAnchor="middle">from earlier installs</text>
        <text className={clsx('pb-dg-text', styles.muted)} x="323" y="228" textAnchor="middle">served before any request</text>
        <text className={clsx('pb-dg-text', styles.muted)} x="323" y="246" textAnchor="middle">to a vendor repository</text>

        <path className={styles.edgeDown} d="M409 110H492M409 180H492" />
        <Break x={466} y={110} />
        <Break x={466} y={180} />

        <rect className={styles.nodeDown} x="492" y="82" width="148" height="56" rx="8" />
        <text className={clsx('pb-dg-text', styles.small)} x="566" y="106" textAnchor="middle">vendor-a repository</text>
        <text className={clsx('pb-dg-mono', styles.small, styles.downText)} x="566" y="125" textAnchor="middle">503</text>
        <rect className={styles.nodeDown} x="492" y="152" width="148" height="56" rx="8" />
        <text className={clsx('pb-dg-text', styles.small)} x="566" y="176" textAnchor="middle">vendor-b repository</text>
        <text className={clsx('pb-dg-mono', styles.small, styles.downText)} x="566" y="195" textAnchor="middle">timed out</text>
      </g>
    </svg>
  );
}

function NarrowDiagram() {
  return (
    <svg className={styles.narrow} viewBox="0 0 280 400" aria-hidden="true" focusable="false">
      <Markers id="of-n" />
      <rect className="pb-dg-node" x="40" y="0" width="200" height="56" rx="8" />
      <text className="pb-dg-text" x="140" y="23" textAnchor="middle">CI pipeline</text>
      <text className="pb-dg-mono" x="140" y="42" textAnchor="middle">composer install</text>

      <path className="pb-dg-edge" d="M118 56V102" markerEnd="url(#of-n-arrow)" />
      <text className={clsx('pb-dg-mono', styles.small)} x="110" y="84" textAnchor="end">pb_svc_</text>
      <path className={styles.edgeOk} d="M162 104V58" markerEnd="url(#of-n-ok)" />
      <text className={clsx('pb-dg-mono', styles.small, styles.okText)} x="170" y="84">200</text>

      <rect className="pb-dg-broker" x="16" y="106" width="248" height="186" rx="12" />
      <text className={clsx('pb-dg-text', styles.title)} x="140" y="132" textAnchor="middle">Package Broker</text>
      <Cylinder cx={140} top={158} rx={84} height={78} />
      <text className={clsx('pb-dg-text', styles.title)} x="140" y="200" textAnchor="middle">Stored archives</text>
      <text className={clsx('pb-dg-text', styles.muted)} x="140" y="220" textAnchor="middle">from earlier installs</text>
      <text className={clsx('pb-dg-text', styles.muted)} x="140" y="264" textAnchor="middle">served before any request</text>
      <text className={clsx('pb-dg-text', styles.muted)} x="140" y="281" textAnchor="middle">to a vendor repository</text>

      <path className={styles.edgeDown} d="M68 292V344M212 292V344" />
      <Break x={68} y={318} />
      <Break x={212} y={318} />

      <rect className={styles.nodeDown} x="0" y="344" width="136" height="56" rx="8" />
      <text className={clsx('pb-dg-text', styles.small)} x="68" y="368" textAnchor="middle">vendor-a repository</text>
      <text className={clsx('pb-dg-mono', styles.small, styles.downText)} x="68" y="387" textAnchor="middle">503</text>
      <rect className={styles.nodeDown} x="144" y="344" width="136" height="56" rx="8" />
      <text className={clsx('pb-dg-text', styles.small)} x="212" y="368" textAnchor="middle">vendor-b repository</text>
      <text className={clsx('pb-dg-mono', styles.small, styles.downText)} x="212" y="387" textAnchor="middle">timed out</text>
    </svg>
  );
}

const terminal: {text: string; kind?: 'prompt' | 'muted' | 'ok'}[] = [
  {text: '$ composer install --no-dev --optimize-autoloader', kind: 'prompt'},
  {text: 'Installing dependencies from lock file'},
  {text: 'Verifying lock file contents can be installed on current platform.'},
  {text: '  - Downloading vendor-a/module-x (<version>)'},
  {text: '  - Downloading vendor-b/module-y (<version>)'},
  {text: '  …', kind: 'muted'},
  {text: '  - Installing vendor-a/module-x (<version>): Extracting archive'},
  {text: '  - Installing vendor-b/module-y (<version>): Extracting archive'},
  {text: '  …', kind: 'muted'},
  {text: 'Generating optimized autoload files', kind: 'ok'},
];

export default function OutageFlow() {
  const captionId = useId();
  return (
    <figure className={styles.root} aria-labelledby={captionId}>
      <div className={styles.grid}>
        <div className={styles.diagram}>
          <WideDiagram />
          <NarrowDiagram />
        </div>
        <div className={styles.terminal}>
          <div className={styles.termHead}>
            <span className={styles.termTitle}>deploy › composer install</span>
            <span className={styles.termBadges}>
              <span className="pb-badge">Illustration</span>
              <span className={clsx('pb-badge pb-badge--danger', styles.downBadge)}>vendor-a repository: unavailable</span>
            </span>
          </div>
          <pre className={styles.termBody} tabIndex={0} role="region" aria-label="Illustration: composer install output while the vendor-a repository is unavailable">
            <code>
              {terminal.map((line, i) => (
                <span key={i} className={clsx(styles.line, line.kind && styles[line.kind])}>{line.text}{'\n'}</span>
              ))}
            </code>
          </pre>
          <div className={styles.termFoot}>
            <span className="pb-badge pb-badge--success">Archives served by <code>&lt;broker-host&gt;</code> from storage</span>
          </div>
        </div>
      </div>
      <ul className={styles.cases}>
        <li>
          <CircleCheck className={clsx(styles.caseIcon, styles.caseOk)} aria-hidden />
          <span><strong>Installed through the broker before:</strong> served from the stored archive while the vendor repository is down or slow, or a key stops working.</span>
        </li>
        <li>
          <Hourglass className={clsx(styles.caseIcon, styles.caseWait)} aria-hidden />
          <span><strong>First install of a new version:</strong> still needs the vendor repository once. After that, the broker keeps the archive.</span>
        </li>
      </ul>
      <figcaption id={captionId} className="pb-visually-hidden">
        CI runs composer install against Package Broker. The broker serves archives it stored during earlier installs, so the install completes while the vendor-a repository returns 503 and the vendor-b repository times out. A version never installed through the broker still needs the vendor repository once.
      </figcaption>
    </figure>
  );
}
