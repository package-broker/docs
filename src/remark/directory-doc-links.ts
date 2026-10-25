import {existsSync} from 'node:fs';
import path from 'node:path';
import type {Root} from 'mdast';
import type {Transformer} from 'unified';
import {visit} from 'unist-util-visit';

export default function directoryDocLinks(): Transformer<Root> {
  return (tree, file) => {
    visit(tree, 'link', node => {
      const suffixStart = node.url.search(/[?#]/);
      const pathname = suffixStart < 0 ? node.url : node.url.slice(0, suffixStart);
      const suffix = suffixStart < 0 ? '' : node.url.slice(suffixStart);
      if (!pathname.endsWith('/') || /^(?:[a-z][\w+.-]*:|[\/#?])/i.test(pathname)) return;
      if (existsSync(path.resolve(path.dirname(String(file.path)), pathname, 'README.md'))) {
        node.url = pathname + 'README.md' + suffix;
      }
    });
  };
}
