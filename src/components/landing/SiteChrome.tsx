import {useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import ColorModeToggle from '@theme/Navbar/ColorModeToggle';
import contacts from '../../data/contacts.json';
import {Menu, X} from 'lucide-react';
import {footerLinks, headerLinks} from '../../data/landing';

export function LandingHeader() {
  const {pathname} = useLocation();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    // This page owns the background list; preserve the host's existing inert state.
    const background = Array.from(document.querySelectorAll<HTMLElement>(
      'main, .pb-site-footer, aside, a[href="#__docusaurus_skipToContent_fallback"]',
    )).filter(element => !header.current?.contains(element) && !element.contains(header.current));
    const previous = background.map(element => [element, element.inert] as const);
    for (const [element] of previous) element.inert = true;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => {
      for (const [element, inert] of previous) element.inert = inert;
      document.removeEventListener('pointerdown', outside);
    };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1100px)');
    const onBreakpoint = () => {
      const focused = document.activeElement;
      setOpen(false);
      if (focused instanceof HTMLElement && header.current?.contains(focused)) {
        if (desktop.matches && focused === toggle.current) header.current.querySelector<HTMLAnchorElement>('.pb-brand')?.focus();
        else if (!desktop.matches && focused.closest('.pb-site-nav')) toggle.current?.focus();
      }
    };
    desktop.addEventListener('change', onBreakpoint);
    return () => desktop.removeEventListener('change', onBreakpoint);
  }, []);
  function close() {setOpen(false);}
  return (
    <header ref={header} className="pb-site pb-site-header pb-site-header--sticky" onKeyDown={event => {
      if (event.key === 'Escape' && open) {close(); toggle.current?.focus();}
    }} onBlur={event => {if (!event.currentTarget.contains(event.relatedTarget)) close();}}>
      <Link className="pb-brand" aria-label="Package Broker home" to="/">
        <img className="pb-brand__mark" src="/img/logo.svg" alt="" width="32" height="32"/>
        <span className="pb-brand__name">Package Broker</span>
      </Link>
      <span className="pb-site-header__spacer"/>
      <Link className="pb-btn pb-btn--primary pb-btn--sm pb-site-header__cta" to="/#quickstart" onClick={close}>Start the quickstart</Link>
      <ColorModeToggle className="pb-theme-toggle"/>
      <button ref={toggle} type="button" className="pb-btn pb-site-nav-toggle" aria-expanded={open}
        aria-controls="landing-nav" aria-label="Menu" onClick={() => setOpen(!open)}>
        <Menu className="pb-icon pb-icon--open" aria-hidden="true"/><X className="pb-icon pb-icon--close" aria-hidden="true"/>
        <span className="pb-site-nav-toggle__label">Menu</span>
      </button>
      <nav className="pb-site-nav" id="landing-nav" aria-label="Main">
        <ul>{headerLinks.map(({label, ...destination}) => <li key={label}><Link {...destination} aria-current={'to' in destination && (label === 'Compare'
          ? pathname === '/compare' || pathname.startsWith('/compare/')
          : destination.to?.replace(/\/+$/, '') === pathname.replace(/\/+$/, '')) ? 'page' : undefined} onClick={close}>{label}</Link></li>)}</ul>
      </nav>
    </header>
  );
}

export function LandingFooter() {
  return (
    <footer className="pb-site-footer" id="footer">
      <div className="pb-wrap">
        <nav aria-label="Footer"><ul>{footerLinks.map(({label, ...destination}) => <li key={label}><Link className="pb-link" {...destination}>{label}</Link></li>)}</ul></nav>
        <p className="pb-site-footer__contact">Contact: <a className="pb-link" href={`mailto:${contacts.support}`}>{contacts.support}</a></p>
        <p>Maintained by <a className="pb-link" href="https://github.com/lbajsarowicz">lbajsarowicz</a>.</p>
        <p>Package Broker is licensed under AGPL-3.0-only.</p>
      </div>
    </footer>
  );
}
