import React, { useState } from 'react';
import clsx from 'clsx';
import { Copy, Check } from 'lucide-react';
import styles from './CodeTabs.module.css';

interface Tab {
  label: string;
  content: string;
  language?: string;
}

interface CodeTabsProps {
  tabs: Tab[];
}

export default function CodeTabs({ tabs }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const text = tabs[activeTab].content;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={styles.codeTabsContainer}>
      <div className={styles.tabHeader}>
        <div className={styles.tabs}>
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              className={clsx(styles.tab, activeTab === idx && styles.activeTab)}
              onClick={() => setActiveTab(idx)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          className={styles.copyButton}
          onClick={copyToClipboard}
          title="Copy to clipboard"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <div className={styles.codeBlock}>
        <pre className={styles.pre}>
          <code className={styles.code}>{tabs[activeTab].content}</code>
        </pre>
      </div>
    </div>
  );
}

