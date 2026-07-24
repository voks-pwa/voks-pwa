import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, '..', 'dist', 'assets');
const limitKiB = 3500;

let total = 0;
for (const file of readdirSync(dist)) {
  if (file.endsWith('.js') || file.endsWith('.css')) {
    total += statSync(join(dist, file)).size;
  }
}

const totalKiB = Math.round(total / 1024);
const ok = totalKiB <= limitKiB;

console.log(`Bundle JS+CSS: ${totalKiB} KiB ${ok ? '✅' : '❌'} (limit ${limitKiB} KiB)`);

if (!ok) {
  console.error(`Bundle size ${totalKiB} KiB exceeds limit ${limitKiB} KiB`);
  process.exit(1);
}
