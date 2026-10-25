import OriginalMermaid from '@theme-original/Mermaid';
import type {Props} from '@theme/Mermaid';
import type {} from '@docusaurus/theme-mermaid';

export default function Mermaid(props: Props) {
  return <div className="mermaid"><OriginalMermaid {...props} /></div>;
}
