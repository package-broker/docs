import {useEffect, useState} from 'react';
import {analyticsEnabled, currentConsent, subscribeConsent, type ConsentChoice} from '../../lib/analytics';

export function useConsent(): {ready: boolean; enabled: boolean; choice: ConsentChoice | null} {
  const [, bump] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    return subscribeConsent(() => bump(value => value + 1));
  }, []);
  return {ready, enabled: ready && analyticsEnabled(), choice: ready ? currentConsent() : null};
}
