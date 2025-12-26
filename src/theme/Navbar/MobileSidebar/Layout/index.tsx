/**
 * Custom Mobile Sidebar Layout
 * Simplified single-panel design (no secondary menu sliding)
 */

import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import GitHubStarsButton from '../../../../components/GitHubStarsButton';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type Props = {
  header: ReactNode;
  primaryMenu: ReactNode;
  secondaryMenu: ReactNode;
};

export default function NavbarMobileSidebarLayout({
  header,
  primaryMenu,
}: Props): ReactNode {
  return (
    <div
      className={clsx(
        ThemeClassNames.layout.navbar.mobileSidebar.container,
        'navbar-sidebar',
        styles.sidebarContainer,
      )}>
      {/* Header with logo and close button */}
      {header}
      
      {/* Primary Menu - always visible */}
      <div className={styles.menuContent}>
        <nav className={styles.menuNav}>
          {primaryMenu}
        </nav>
      </div>
      
      {/* Footer Actions */}
      <div className={styles.mobileSidebarFooter}>
        <Link
          to="/docs/"
          className={styles.getStartedButton}
          aria-label="Get Started">
          Get Started
        </Link>
        <GitHubStarsButton variant="mobile-footer" className={styles.githubButton} />
      </div>
    </div>
  );
}
