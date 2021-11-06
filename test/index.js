
process.on('uncaughtException', console.log);
process.on('unhandledRejection', console.log);
process.on('rejectionHandled', console.log);

import fs from 'fs';
import path from 'path';
import url from 'url';

import { parse as busboy_parse } from './lib/busboy.js';
import { parse as formidable_parse } from './lib/formidable.js';
import { parse as multiparty_parse } from './lib/multiparty.js';
import { parse as mntm_parse } from './lib/mntm.multipart.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.resolve(__dirname, './data/simple.txt');

const SIMPLE = fs.readFileSync(file);
const SIMPLE_BOUNDARY = '--simple';

const bench = (name, fn) => {
  return async () => {
    console.log('-----');
    console.time(name);
    for (let i = 100000; --i;) {
      await fn();
    }
    console.timeEnd(name);
    console.log('-----');
  }
};

const suite = async (items) => {
  for (const item of items) {
    await item();
  }
};

suite([
  bench('mntm #round1', () => mntm_parse(SIMPLE, SIMPLE_BOUNDARY)),
  bench('busboy #round1', () => busboy_parse(SIMPLE, SIMPLE_BOUNDARY)),
  bench('formidable #round1', () => formidable_parse(SIMPLE, SIMPLE_BOUNDARY)),
  bench('multiparty #round1', () => multiparty_parse(SIMPLE, SIMPLE_BOUNDARY)),

  bench('mntm #round2', () => mntm_parse(SIMPLE, SIMPLE_BOUNDARY)),
  bench('busboy #round2', () => busboy_parse(SIMPLE, SIMPLE_BOUNDARY)),
  bench('formidable #round2', () => formidable_parse(SIMPLE, SIMPLE_BOUNDARY)),
  bench('multiparty #round2', () => multiparty_parse(SIMPLE, SIMPLE_BOUNDARY)),
]).then(() => {
  console.log('done');
}).catch((ex) => {
  console.error(ex);
});
