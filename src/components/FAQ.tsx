import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './FAQ.module.css';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'Is Cloudflare free tier enough for my team?',
    answer: 'Yes! Cloudflare Workers free tier includes 100,000 requests per day, which is sufficient for most small agencies. For larger teams, you can upgrade to Cloudflare Workers Paid ($5/month) or deploy on Docker/Kubernetes for unlimited usage.',
  },
  {
    question: 'How do authentication tokens work?',
    answer: 'PACKAGE.broker uses secure token-based authentication. Generate tokens in the dashboard, then use them in your composer.json or CI/CD environment variables. Tokens can be scoped to specific repositories and have expiration dates for enhanced security.',
  },
  {
    question: 'Do you support GitHub, GitLab, and Bitbucket?',
    answer: 'Yes! PACKAGE.broker supports all major Git providers: GitHub, GitLab, Bitbucket, and any Git repository accessible via HTTPS or SSH. You can also connect to Composer repositories like Packagist, Private Packagist™, or Satis instances.',
  },
  {
    question: 'What\'s the status of Docker and Kubernetes deployments?',
    answer: 'Docker and Kubernetes support are in active development as part of our architectural refactor. Cloudflare Workers is available now and recommended for most use cases. We\'ll announce Docker availability in our GitHub releases and documentation when ready.',
  },
  {
    question: 'Is PACKAGE.broker SOC-2 ready?',
    answer: 'Yes! PACKAGE.broker is built with compliance in mind. It includes token-based access control, encrypted credential storage, comprehensive audit logging, and follows security best practices. While we don\'t provide SOC-2 certification (that\'s your responsibility), we provide all the tools and documentation needed for your audit.',
  },
  {
    question: 'How does caching work?',
    answer: 'PACKAGE.broker caches packages at the edge (Cloudflare) or in your storage backend (S3, R2, MinIO). On first request, packages are fetched from source and stored. Subsequent requests are served instantly from cache, dramatically reducing install times. Cache invalidation happens automatically via webhooks or manually through the dashboard.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.faqContainer}>
      <div className={styles.faqHeader}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <p className={styles.faqSubtitle}>
          Everything you need to know about PACKAGE.broker
        </p>
      </div>
      <div className={styles.faqList}>
        {faqItems.map((item, index) => (
          <div
            key={index}
            className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}
          >
            <button
              className={styles.faqQuestion}
              onClick={() => toggleItem(index)}
              aria-expanded={openIndex === index}
            >
              <span className={styles.questionText}>{item.question}</span>
              <ChevronDown
                className={`${styles.chevron} ${openIndex === index ? styles.rotated : ''}`}
                size={20}
              />
            </button>
            <div className={styles.faqAnswer}>
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

