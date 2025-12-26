import React from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import styles from './styles.module.css';

export default function NavbarMobileSidebarPrimaryMenu(): JSX.Element {
  const mobileSidebar = useNavbarMobileSidebar();
  const {navbar} = useThemeConfig();

  // Filter items: keep left-positioned items, exclude GitHub stars HTML and CTA button
  const items = navbar.items.filter((item: any) => {
    // Skip HTML items (GitHub stars badge)
    if (item.type === 'html') {
      return false;
    }
    // Skip right-positioned items (CTA button - we have it in footer)
    if (item.position === 'right') {
      return false;
    }
    return true;
  });

  return (
    <ul className={styles.menuList}>
      {items.map((item: any, i: number) => (
        <NavbarItem
          mobile
          {...item}
          onClick={() => mobileSidebar.toggle()}
          key={i}
        />
      ))}
    </ul>
  );
}
