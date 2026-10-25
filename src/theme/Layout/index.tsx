import OriginalLayout from '@theme-original/Layout';
import type {Props} from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import {usePluginData} from '@docusaurus/useGlobalData';
import PageHead from '../PageHead';

export default function Layout({children, ...props}: Props) {
  const {pathname} = useLocation();
  const route = pathname.replace(/\/$/, '') || '/';
  const {pages} = usePluginData('page-metadata') as {pages: Record<string, unknown>};
  // Docs mount their Head inside DocItem/Metadata, together with the doc route.
  // Unknown paths (including /docs/*) still receive the 404 page metadata.
  const docPage = route.startsWith('/docs/') && Object.hasOwn(pages, route);
  return <OriginalLayout {...props}>{children}{!docPage && <PageHead key={pathname}/>}</OriginalLayout>;
}
