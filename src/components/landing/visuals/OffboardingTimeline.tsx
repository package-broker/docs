import {CircleCheck, KeyRound, LogOut, UserRoundMinus, Workflow} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {useId, type ReactNode} from 'react';
import clsx from 'clsx';
import styles from './OffboardingTimeline.module.css';

const steps: {when: string; title: string; detail: ReactNode; icon: LucideIcon}[] = [
  {when: '0 h', title: 'Removed from the group in your identity provider', detail: 'Ends their group access.', icon: UserRoundMinus},
  {when: 'up to 12 h', title: 'Browser session ends', detail: 'Sessions last 12 h at most and end after 1 h idle.', icon: LogOut},
  {when: 'within 24 h', title: 'Personal token stops working', detail: <><code>pb_pat_</code> tokens lose group access once the last sign-in is over 24 h old. Developers keep a personal token active by signing in to the broker at least once a day; CI service tokens are not affected.</>, icon: KeyRound},
];

const todayKeys = ['client-a Marketplace', 'vendor-a', 'CI variables'];
const moreKeys = 9;

export default function OffboardingTimeline() {
  const captionId = useId();
  return (
    <figure className={styles.root} aria-labelledby={captionId}>
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.lane}>With Package Broker</span>
          <span className="pb-badge pb-badge--success">No vendor keys to rotate</span>
        </div>
        <ol className={styles.steps}>
          {steps.map(({when, title, detail, icon: Icon}, i) => (
            <li key={title} className={styles.step}>
              <span className={styles.when}>{when}</span>
              <span className={clsx(styles.marker, i === 0 && styles.markerStart)}><Icon aria-hidden /></span>
              <span className={styles.stepTitle}>{title}</span>
              <span className={styles.detail}>{detail}</span>
            </li>
          ))}
        </ol>
        <div className={styles.notes}>
          <p className={styles.note}>
            <Workflow className={styles.noteIcon} aria-hidden />
            <span><strong>CI service tokens</strong> (<code>pb_svc_</code>) are not tied to a person. Revoke them in the broker; it applies on the next request.</span>
          </p>
          <p className={styles.note}>
            <CircleCheck className={styles.noteIcon} aria-hidden />
            <span><strong>E-mail grants:</strong> remove the grant or suspend the user in the broker; applies on their next request.</span>
          </p>
        </div>
      </div>

      <div className={styles.today}>
        <div className={styles.todayText}>
          <span className={styles.lane}>Today</span>
          <span>Rotate every key the person had, at every client and vendor, then update <code>auth.json</code> and CI variables.</span>
        </div>
        <ul className={styles.keys} aria-label="Client, vendor and CI keys to rotate">
          {todayKeys.map(k => (
            <li key={k} className={styles.key}><KeyRound aria-hidden /><span>{k}</span></li>
          ))}
          <li className={styles.key}><span aria-hidden="true">+{moreKeys}</span><span className="pb-visually-hidden">{moreKeys} more keys</span></li>
        </ul>
      </div>
      <figcaption id={captionId} className="pb-visually-hidden">
        After someone is removed from the group in your identity provider, their browser session ends within 12 hours (or after 1 hour idle) and their personal token stops working within 24 hours. Developers keep a personal token active by signing in at least once a day. CI service tokens are revoked separately in the broker. For e-mail grants, remove the grant or suspend the user in the broker; this applies on their next request. Without the broker, every client and vendor key the person had must be rotated.
      </figcaption>
    </figure>
  );
}
