import { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import { Github } from 'lucide-react';
import clsx from 'clsx';
import styles from './GitHubStarsButton.module.css';

interface GitHubStarsButtonProps {
  variant?: 'default' | 'mobile-footer';
  className?: string;
}

export default function GitHubStarsButton({ 
  variant = 'default',
  className 
}: GitHubStarsButtonProps) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/package-broker/server');
        if (res.ok) {
          const data = await res.json();
          setStars(data.stargazers_count);
        }
      } catch (e) {
        console.error('Failed to fetch stars', e);
      }
    };
    fetchStars();
  }, []);

  return (
    <Link
      className={clsx(
        styles.githubButton,
        variant === 'mobile-footer' && styles.mobileFooter,
        className
      )}
      to="https://github.com/package-broker/server"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Star package-broker/server on GitHub${stars !== null ? ` (${stars} stars)` : ''}`}>
      <Github size={20} aria-hidden="true" />
      <span>GitHub</span>
      {stars !== null && (
        <span className={styles.starBadge} aria-label={`${stars} stars`}>
          {stars}
        </span>
      )}
    </Link>
  );
}

