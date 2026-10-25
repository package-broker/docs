import {useContext} from 'react';
import {MarketingPageContext} from '../../components/marketing/MarketingPageContext';
import OriginalNavbar from '@theme-original/Navbar';
import {useLocation} from '@docusaurus/router';
import {LandingHeader} from '../../components/landing/SiteChrome';

export default function Navbar() {
  const marketingPage = useContext(MarketingPageContext);
  return (useLocation().pathname === '/' || marketingPage) ? <LandingHeader/> : <OriginalNavbar/>;
}
