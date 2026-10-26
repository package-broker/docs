import {useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {setConsent, type ConsentChoice} from '../../lib/analytics';
import {useConsent} from './useConsent';
import styles from './ConsentBanner.module.css';

const messages: Record<ConsentChoice, string> = {
  accepted: 'Analytics accepted. You can withdraw consent on the privacy page at any time.',
  refused: 'Analytics refused. You can change your choice on the privacy page at any time.',
};

export default function ConsentBanner() {
  const {enabled, choice} = useConsent();
  const {pathname} = useLocation();
  const [message, setMessage] = useState('');
  const status = useRef<HTMLParagraphElement>(null);

  useEffect(() => setMessage(''), [pathname]);
  useEffect(() => {
    if (message) status.current?.focus();
  }, [message]);

  if (!enabled) return null;
  const pending = choice === null;
  if (!pending && !message) return null;

  function choose(next: ConsentChoice) {
    setConsent(next);
    if (pathname.replace(/\/$/, '') === '/privacy') {
      document.querySelector<HTMLElement>('[role="switch"]')?.focus();
      return;
    }
    setMessage(messages[next]);
  }

  return <div className={`pb-site ${styles.dock}`}>
    {pending && <section className={`pb-consent ${styles.banner}`} aria-labelledby="consent-heading">
      <h2 id="consent-heading">Analytics preferences</h2>
      <p>Allow Google Analytics to measure how this site is used? Nothing is sent to Google until you choose. You can change your choice later. <Link className="pb-link" to="/privacy">Read the privacy notice</Link>.</p>
      <div className="pb-consent__actions">
        <button type="button" className="pb-btn" onClick={() => choose('accepted')}>Accept analytics</button>
        <button type="button" className="pb-btn" onClick={() => choose('refused')}>Refuse analytics</button>
      </div>
    </section>}
    {message && <p ref={status} className={`pb-consent__status ${styles.status}`} role="status" aria-live="polite" tabIndex={-1}>{message}</p>}
  </div>;
}
