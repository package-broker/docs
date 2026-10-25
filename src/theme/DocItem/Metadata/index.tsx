import OriginalMetadata from '@theme-original/DocItem/Metadata';
import {useLocation} from '@docusaurus/router';
import PageHead from '../../PageHead';

export default function DocItemMetadata() {
  const {pathname} = useLocation();
  return <><OriginalMetadata/><PageHead key={pathname}/></>;
}
