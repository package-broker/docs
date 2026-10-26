import type {LucideIcon} from 'lucide-react';
import {DatabaseBackup, FolderLock, KeyRound, UserRoundMinus, UsersRound, Workflow} from 'lucide-react';
import clsx from 'clsx';
import styles from './ValueIcons.module.css';

export type IconTileSize = 'sm' | 'md' | 'lg';
export type IconTileTone = 'accent' | 'brand' | 'success' | 'neutral';

export interface ValueIconProps {
  size?: IconTileSize;
  tone?: IconTileTone;
  className?: string;
  label?: string;
}

export function IconTile({icon: Icon, size = 'md', tone = 'accent', className, label}: ValueIconProps & {icon: LucideIcon}) {
  return (
    <span
      className={clsx(styles.tile, styles[tone], size !== 'md' && styles[size], className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}>
      <Icon className={styles.icon} strokeWidth={1.75} aria-hidden />
    </span>
  );
}

export const OffboardingIcon = (p: ValueIconProps) => <IconTile icon={UserRoundMinus} {...p} />;
export const FreelancerIcon = (p: ValueIconProps) => <IconTile icon={FolderLock} {...p} />;
export const OutageIcon = (p: ValueIconProps) => <IconTile icon={DatabaseBackup} {...p} />;
export const OneTokenIcon = (p: ValueIconProps) => <IconTile icon={KeyRound} {...p} />;
export const NoSeatsIcon = (p: ValueIconProps) => <IconTile icon={UsersRound} {...p} />;
export const CiTokenIcon = (p: ValueIconProps) => <IconTile icon={Workflow} {...p} />;
