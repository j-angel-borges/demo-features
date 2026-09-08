const path = require('path');
const esbuild = require('esbuild');

const sharedDir = __dirname;
esbuild.buildSync({
  entryPoints: [path.join(sharedDir, 'src/index.ts')],
  outfile: path.join(sharedDir, 'dist/index.cjs'),
  format: 'cjs',
  platform: 'node',
  bundle: true,
  external: ['firebase', 'firebase/*'],
});
console.log('Successfully bundled @zentry/shared to dist/index.cjs');
