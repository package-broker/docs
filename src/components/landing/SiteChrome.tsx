import {useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import ColorModeToggle from '@theme/Navbar/ColorModeToggle';
import {Menu, X} from 'lucide-react';
import {footerLinks, headerLinks} from '../../data/landing';

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  function close() {setOpen(false);}
  return (
    <header className="pb-site pb-site-header pb-site-header--sticky" onKeyDown={event => {
      if (event.key === 'Escape' && open) {close(); toggle.current?.focus();}
    }} onBlur={event => {if (!event.currentTarget.contains(event.relatedTarget)) close();}}>
      <Link className="pb-brand" aria-label="Package Broker home" to="/">
        <img className="pb-brand__mark" src="/img/logo.svg" alt="" width="32" height="32"/>
        <span className="pb-brand__name">Package Broker</span>
      </Link>
      <span className="pb-site-header__spacer"/>
      <Link className="pb-btn pb-btn--primary pb-btn--sm pb-site-header__cta" to="#quickstart" onClick={close}>Start the quickstart</Link>
      <ColorModeToggle className="pb-theme-toggle"/>
      <button ref={toggle} type="button" className="pb-btn pb-site-nav-toggle" aria-expanded={open}
        aria-controls="landing-nav" aria-label="Menu" onClick={() => setOpen(!open)}>
        <Menu className="pb-icon pb-icon--open" aria-hidden="true"/><X className="pb-icon pb-icon--close" aria-hidden="true"/>
        <span className="pb-site-nav-toggle__label">Menu</span>
      </button>
      <nav className="pb-site-nav" id="landing-nav" aria-label="Main">
        <ul>{headerLinks.map(link => <li key={link.label}><Link to={link.href} onClick={close}>{link.label}</Link></li>)}</ul>
      </nav>
    </header>
  );
}

export function LandingFooter() {
  return (
    <footer className="pb-site-footer" id="footer">
      <div className="pb-wrap">
        <nav aria-label="Footer"><ul>{footerLinks.map(link => <li key={link.label}><Link className="pb-link" to={link.href}>{link.label}</Link></li>)}</ul></nav>
        <p className="pb-site-footer__contact">Contact: <a className="pb-link" href="mailto:hi@package.broker">hi@package.broker</a></p>
        <p>Package Broker is licensed under AGPL-3.0-only.</p>
      </div>
    </footer>
  );
}
