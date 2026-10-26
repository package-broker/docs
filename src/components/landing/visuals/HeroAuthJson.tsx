import {useId, type ReactNode} from 'react';
import {ArrowDown} from 'lucide-react';
import styles from './HeroAuthJson.module.css';

type Line = {indent: 0 | 1 | 2 | 3; body: ReactNode; old?: boolean; mark?: boolean};

const indents = [styles.i0, styles.i1, styles.i2, styles.i3];

const k = (s: string) => <span className={styles.key}>"{s}"</span>;
const v = (s: string) => <span className={styles.str}>"{s}"</span>;
const p = (s: string) => <span className={styles.punct}>{s}</span>;

function cred(host: string, user: string, pass: string, last = false): Line[] {
  return [
    {indent: 2, body: <>{k(host)}{p(': {')}</>, old: true},
    {indent: 3, body: <>{k('username')}{p(': ')}{v(user)}{p(',')}</>, old: true},
    {indent: 3, body: <>{k('password')}{p(': ')}{v(pass)}</>, old: true},
    {indent: 2, body: p(last ? '}' : '},')},
  ];
}

const today: Line[] = [
  {indent: 0, body: p('{')},
  {indent: 1, body: <>{k('http-basic')}{p(': {')}</>},
  ...cred('repo.magento.com', 'a1f3…', '7be2…'),
  ...cred('composer.vendor-a.example', 'c94d…', '0e5a…'),
  ...cred('composer.vendor-b.example', '5d07…', 'b81c…', true),
  {indent: 1, body: p('}')},
  {indent: 0, body: p('}')},
];

const broker: Line[] = [
  {indent: 0, body: p('{')},
  {indent: 1, body: <>{k('http-basic')}{p(': {')}</>},
  {indent: 2, body: <>{k('<broker-host>')}{p(': {')}</>, mark: true},
  {indent: 3, body: <>{k('username')}{p(': ')}{v('token')}{p(',')}</>, mark: true},
  {indent: 3, body: <>{k('password')}{p(': ')}{v('pb_pat_…')}</>, mark: true},
  {indent: 2, body: p('}')},
  {indent: 1, body: p('}')},
  {indent: 0, body: p('}')},
];

function Code({lines}: {lines: Line[]}) {
  return (
    <pre className={styles.code}>
      {lines.map((line, i) => (
        <span key={i} className={[styles.line, line.old && styles.old, line.mark && styles.mark].filter(Boolean).join(' ')}>
          <span className={styles.num}>{i + 1}</span>
          <span className={`${styles.text} ${indents[line.indent]}`}>{line.body}</span>
        </span>
      ))}
    </pre>
  );
}

function Chrome({tabs, badge, badgeClass}: {tabs: string[]; badge: string; badgeClass: string}) {
  return (
    <div className={styles.chrome}>
      <span className={styles.dots}><i/><i/><i/></span>
      <span className={styles.tabs}>
        {tabs.map((t, i) => <span key={t} className={i === 0 ? styles.tabActive : styles.tab}>{t}</span>)}
        {tabs.length > 1 && <span className={styles.more}>+{tabs.length - 1}</span>}
      </span>
      <span className={`${styles.badge} ${badgeClass}`}>{badge}</span>
    </div>
  );
}

export default function HeroAuthJson({className}: {className?: string}) {
  const captionId = useId();
  return (
    <figure className={[styles.root, className].filter(Boolean).join(' ')} aria-labelledby={captionId}>
      <div className={styles.deck} aria-hidden="true">
        <div className={styles.ghost}/>
        <div className={styles.ghost2}/>
        <div className={`${styles.window} ${styles.before}`}>
          <Chrome tabs={['client-a/auth.json', 'client-b/auth.json', 'client-c/auth.json']} badge="Today" badgeClass={styles.badgeDanger}/>
          <Code lines={today}/>
        </div>
      </div>
      <div className={styles.bridge} aria-hidden="true">
        <span className={styles.bridgeIcon}><ArrowDown size={16} strokeWidth={2}/></span>
        <span>Client keys move into the broker</span>
      </div>
      <div className={`${styles.window} ${styles.after}`} aria-hidden="true">
        <Chrome tabs={['auth.json']} badge="With Package Broker" badgeClass={styles.badgeBrand}/>
        <Code lines={broker}/>
        <p className={styles.foot}>One entry covers every client project your token can access.</p>
      </div>
      <figcaption id={captionId} className="pb-visually-hidden">
        Today, each client project has an auth.json with a repo.magento.com Marketplace key and keys for two vendor repositories, copied to every laptop and CI runner. With Package Broker, auth.json has one entry: the broker host, username token and a personal token starting pb_pat_. One entry covers every client project your token can access.
      </figcaption>
    </figure>
  );
}
