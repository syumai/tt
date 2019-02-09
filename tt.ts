#!/usr/bin/env deno --allow-all

import {
  args,
  cwd,
  run,
  readDirSync,
  mkdirSync,
  writeFileSync,
  removeSync,
} from 'deno';
import * as path from 'https://deno.land/x/fs/path/mod.ts';
import { resolveDenoDir } from './path_util.ts';
import { generateTestSrc } from './mod.ts';

const DENO_DIR = resolveDenoDir();
const TT_HOME = path.resolve(DENO_DIR, 'tt');
const TT_TMP_DIR_ROOT = path.resolve(TT_HOME, 'tmp');

function genRandomID(): string {
  return (
    Math.random()
      .toString(36)
      .substring(2) +
    Math.random()
      .toString(36)
      .substring(2)
  );
}

function createDirIfNotExists(path: string) {
  try {
    readDirSync(path);
  } catch (e) {
    mkdirSync(path);
  }
}

const enc = new TextEncoder();
const dec = new TextDecoder('utf-8');

async function main() {
  let targetDir = cwd();
  if (args.length > 1) {
    targetDir = path.resolve(targetDir, args[1]);
  }

  const targetFiles = readDirSync(targetDir).filter(
    file => file.isFile && file.name.match(/test\./)
  );

  if (targetFiles.length < 1) {
    return;
  }

  createDirIfNotExists(TT_HOME);
  createDirIfNotExists(TT_TMP_DIR_ROOT);

  const TT_TMP_DIR = path.resolve(TT_TMP_DIR_ROOT, genRandomID());
  createDirIfNotExists(TT_TMP_DIR);

  for (const file of targetFiles) {
    const testPath = path.resolve(TT_TMP_DIR, file.name);
    const testSrc = generateTestSrc(file.path);
    writeFileSync(testPath, enc.encode(testSrc));
    const modules = run({
      args: ['deno', testPath, '--allow-all'],
      stdout: 'piped',
    });
    console.log(dec.decode(await modules.output()));
    modules.close();
  }

  removeSync(TT_TMP_DIR, { recursive: true });
}

main();
