import OriginalNavbar from '@theme-original/Navbar';
import {useLocation} from '@docusaurus/router';
import {LandingHeader} from '../../components/landing/SiteChrome';

export default function Navbar() {
  return useLocation().pathname === '/' ? <LandingHeader/> : <OriginalNavbar/>;
}
