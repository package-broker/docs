import React, { useState } from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ScreenshotGallery.module.css';

interface Screenshot {
  src: string;
  alt: string;
  caption: string;
}

const screenshots: Screenshot[] = [
  {
    src: '/img/screenshots/dashboard-overview.png',
    alt: 'PACKAGE.broker Dashboard Overview',
    caption: 'Dashboard showing repositories, cache stats, and recent activity',
  },
  {
    src: '/img/screenshots/add-repository.png',
    alt: 'Add Repository Source',
    caption: 'Add GitHub, GitLab, or Bitbucket repositories in seconds',
  },
  {
    src: '/img/screenshots/token-management.png',
    alt: 'Token Management',
    caption: 'Secure token-based authentication for CI/CD pipelines',
  },
  {
    src: '/img/screenshots/packages-view.png',
    alt: 'Packages View',
    caption: 'Browse and manage cached Composer packages',
  },
];

export default function ScreenshotGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.galleryHeader}>
        <h3 className={styles.galleryTitle}>See It In Action</h3>
        <p className={styles.gallerySubtitle}>
          Real screenshots from PACKAGE.broker dashboard
        </p>
      </div>

      {/* Desktop Grid View */}
      <div className={styles.desktopGrid}>
        {screenshots.map((screenshot, index) => (
          <div
            key={index}
            className={clsx(styles.screenshotCard, {
              [styles.active]: index === currentIndex,
            })}
            onClick={() => goToSlide(index)}
          >
            <div className={styles.imageWrapper}>
              <img
                src={screenshot.src}
                alt={screenshot.alt}
                className={styles.screenshotImage}
                onError={(e) => {
                  // Fallback to placeholder if image doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%231a1b26" width="400" height="300"/%3E%3Ctext fill="%236b7280" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="14"%3EScreenshot placeholder%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <p className={styles.caption}>{screenshot.caption}</p>
          </div>
        ))}
      </div>

      {/* Mobile Carousel View */}
      <div className={styles.mobileCarousel}>
        <div className={styles.carouselContainer}>
          <button
            className={styles.carouselButton}
            onClick={prevSlide}
            aria-label="Previous screenshot"
          >
            <ChevronLeft size={24} />
          </button>

          <div className={styles.carouselSlide}>
            <div className={styles.imageWrapper}>
              <img
                src={screenshots[currentIndex].src}
                alt={screenshots[currentIndex].alt}
                className={styles.screenshotImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%231a1b26" width="400" height="300"/%3E%3Ctext fill="%236b7280" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="14"%3EScreenshot placeholder%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <p className={styles.caption}>{screenshots[currentIndex].caption}</p>
          </div>

          <button
            className={styles.carouselButton}
            onClick={nextSlide}
            aria-label="Next screenshot"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className={styles.carouselIndicators}>
          {screenshots.map((_, index) => (
            <button
              key={index}
              className={clsx(styles.indicator, {
                [styles.active]: index === currentIndex,
              })}
              onClick={() => goToSlide(index)}
              aria-label={`Go to screenshot ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

