import {existsSync} from 'node:fs';
import path from 'node:path';
import type {Root} from 'mdast';
import type {Transformer} from 'unified';
import {visit} from 'unist-util-visit';

export default function directoryDocLinks(): Transformer<Root> {
  return (tree, file) => {
    visit(tree, 'link', node => {
      if (!node.url.endsWith('/') || /^(?:[a-z][\w+.-]*:|[\/#?])/i.test(node.url)) return;
      if (existsSync(path.resolve(path.dirname(String(file.path)), node.url, 'README.md'))) {
        node.url += 'README.md';
      }
    });
  };
}
