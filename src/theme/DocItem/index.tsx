import OriginalDocItem from '@theme-original/DocItem';
import type {Props} from '@theme/DocItem';
import Link from '@docusaurus/Link';
import {usePluginData} from '@docusaurus/useGlobalData';
import {releaseStatus} from '@site/src/data/landing';
import styles from './styles.module.css';

export default function DocItem(props: Props) {
  const route = props.content.metadata.permalink.replace(/\/$/, '');
  const {pages} = usePluginData('page-metadata') as {pages: Record<string, {dateModified?: string}>};
  const modified = pages[route]?.dateModified;
  return <>
    <aside className={styles.notice} aria-label="Release status">
      <p>Package Broker {releaseStatus}. <Link to="/#quickstart">Start the quickstart</Link> · <Link to="/#status">Get notified</Link></p>
      <p>Last updated: {modified ? <time dateTime={modified}>{new Date(modified).toISOString().slice(0, 10)}</time> : 'Not measured'}</p>
    </aside>
    <OriginalDocItem {...props}/>
    <aside className={styles.notice} aria-label="Next steps">
      {route.startsWith('/docs/troubleshooting/') && <p>Running several client projects? <Link to="/agencies">See how keys stay per client</Link>. Read the <Link to="/docs/guides/mirror-vendor-repositories">vendor repository guide</Link>.</p>}
      <p><Link to="/#quickstart">Start the quickstart</Link> · <Link to="/#status">Get notified</Link></p>
    </aside>
  </>;
}
