import { copyFileSync } from 'node:fs';
import { join } from 'node:path';

const indexPath = join('dist', 'index.html');
const notFoundPath = join('dist', '404.html');

copyFileSync(indexPath, notFoundPath);
console.log('Copied dist/index.html -> dist/404.html for GitHub Pages SPA routing');
