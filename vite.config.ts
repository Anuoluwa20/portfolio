import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

// index.html and main.tsx read VITE_PREVIEW. Default it to empty (a normal build)
// so Vite doesn't warn; the single-file preview build sets it to 1.
process.env.VITE_PREVIEW ??= '';

// Static files normally live in public/. If they were uploaded to the top of
// the repo instead (img/, live/, video/, favicon.svg), copy them into the build too.
const LOOSE_STATIC = ['img', 'live', 'video', 'favicon.svg'];

function looseStatic(): Plugin {
  let outDir = '';
  return {
    name: 'loose-static',
    apply: 'build',
    configResolved(c) {
      outDir = c.build.ssr ? '' : path.resolve(c.root, c.build.outDir);
    },
    closeBundle() {
      if (!outDir) return;
      for (const name of LOOSE_STATIC) {
        const from = path.resolve(name);
        if (!fs.existsSync(from)) continue;
        fs.cpSync(from, path.join(outDir, name), { recursive: true, force: false, errorOnExist: false });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), looseStatic()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
  },
  ssr: {
    noExternal: ['@base-ui/react', 'motion', 'lucide-react'],
  },
});
