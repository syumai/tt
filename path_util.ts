import { env } from 'deno';
import * as path from 'https://deno.land/x/fs/path/mod.ts';

export function resolveDenoDir(): string {
  let { HOME, DENO_DIR } = env();
  if (DENO_DIR) {
    return path.resolve(DENO_DIR);
  }
  if (!HOME) {
    throw new Error('$HOME is not defined.');
  }
  return path.resolve(HOME, '.deno');
}
