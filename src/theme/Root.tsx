import {useEffect, type ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ConsentBanner from '../components/consent/ConsentBanner';
import {notePageView, startAnalytics} from '../lib/analytics';

export default function Root({children}: {children: ReactNode}) {
  const {siteConfig: {customFields}} = useDocusaurusContext();
  const measurementId = typeof customFields?.ga4MeasurementId === 'string' ? customFields.ga4MeasurementId : '';
  const {pathname} = useLocation();

  useEffect(() => startAnalytics(measurementId), [measurementId]);
  useEffect(() => notePageView(), [pathname]);

  return <>
    <ConsentBanner/>
    {children}
  </>;
}
