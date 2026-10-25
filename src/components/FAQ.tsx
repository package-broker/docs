import Link from '@docusaurus/Link';
import type {faqItems} from '../data/landing';
import styles from './FAQ.module.css';

type FAQItem = (typeof faqItems)[number];

export default function FAQ({items}: {items: readonly FAQItem[]}) {
  return <div className={styles.faq}>
    {items.map(item => <details key={item.question}>
      <summary>{item.question}</summary>
      <div className={styles.answer}><p>{item.answer}</p><Link to={item.href}>{item.label}</Link></div>
    </details>)}
  </div>;
}
