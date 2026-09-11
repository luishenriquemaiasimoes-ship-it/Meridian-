/**
 * Deletes the local SQLite database so the next push-and-seed starts clean.
 *
 * This exists instead of `rm -f` in the npm script because npm runs scripts
 * through cmd.exe on Windows, where `rm` is not a command — the reset failed
 * for anyone not on a Unix shell. Node is already a dependency, so doing the
 * delete in Node works the same on every platform.
 *
 * It also removes the -journal, -wal and -shm sidecars. SQLite writes those
 * alongside the database, and leaving them behind next to a fresh file is how
 * a "clean" reset comes back with stale pages in it.
 */
import { rmSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schemaDir = resolve(root, 'prisma');

// Prisma resolves a relative `file:` URL against the schema's directory, not
// the working directory, so the same rule has to be applied here.
function databaseFile() {
  const url = process.env.DATABASE_URL ?? 'file:./meridian.db';
  if (!url.startsWith('file:')) return null;
  const path = url.slice('file:'.length);
  return isAbsolute(path) ? path : resolve(schemaDir, path);
}

const file = databaseFile();
if (!file) {
  console.log('DATABASE_URL is not a local file; nothing to delete.');
} else {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    rmSync(file + suffix, { force: true });
  }
  console.log(`Removed ${file} (and any journal/wal/shm alongside it).`);
}
