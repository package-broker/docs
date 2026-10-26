import {useState} from 'react';
import {setConsent} from '../../lib/analytics';
import {useConsent} from './useConsent';

export default function ConsentSwitch() {
  const {enabled, choice} = useConsent();
  const [message, setMessage] = useState('');
  if (!enabled) return null;
  const on = choice === 'accepted';

  function toggle() {
    const next = on ? 'refused' : 'accepted';
    setConsent(next);
    setMessage(next === 'accepted' ? 'Analytics allowed. The site now sends the events described above to Google Analytics.' : 'Consent withdrawn. The site sends nothing more to Google Analytics.');
  }

  return <div>
    <button type="button" className="pb-switch" role="switch" aria-checked={on} aria-describedby="consent-switch-state" onClick={toggle}>
      <span className="pb-switch__track" aria-hidden="true"/>
      <span>Allow Google Analytics</span>
    </button>
    <p id="consent-switch-state" className="pb-consent__status" role="status" aria-live="polite">
      {message || (choice === null ? 'No choice saved. Analytics is off.' : on ? 'Analytics is allowed.' : 'Analytics is refused.')}
    </p>
  </div>;
}
