import http from 'http';
import undici from 'undici';
import microtime from 'microtime';

import { handleBusboy } from './lib/busboy.js';
import { handleMultipart } from './lib/mntm.multipart.js';
import { handleFormidable } from './lib/formidable.js';
import { handleMultiparty } from './lib/multiparty.js';

import * as simple from './data/simple.js';

const server = http.createServer();

const emit = () => {
  return undici.fetch('http://localhost:3000', {
    method: 'POST',
    body: simple.body,
    headers: {
      'content-length': Buffer.byteLength(simple.body),
      'content-type': `multipart/form-data; boundary=${simple.boundary}`
    }
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Response error');
    }
  });
};

const ROUNDS = 4;
const COUNT = 10000;
const DONE_CALLBACK = () => {
  // TODO
};

/**
 * @const {Record<name, number[]>}
 */
const results = {};

/**
 * @param {string} name
 */
const bench = async (name, handler) => {
  const free = handler(server, DONE_CALLBACK);

  const start = microtime.nowDouble();
  for (let i = COUNT; i--;) {
    await emit();
  };
  const total = microtime.nowDouble() - start;

  free();
  
  const rps = Math.floor(COUNT / total);
  results[name] = results[name] || [];
  results[name].push(rps);
};

server.listen(3000, 'localhost', async () => {
  for (let i = 1; i <= ROUNDS; ++i) {
    console.log(`---- round ${i} ----`);

    await bench('formidable', handleFormidable);

    await bench('multiparty', handleMultiparty);

    await bench('busboy', handleBusboy);

    await bench('@mntm/multipart', handleMultipart);
  }

  server.close(() => {
    const tableName = (name) => String(name).padEnd(16);
    const tableValue = (value) => String(value).padEnd(5);
    const tableRow = (name, min, max, mid) => `|${tableName(name)}|${tableValue(min)}|${tableValue(max)}|${tableValue(mid)}|`;

    console.log(tableRow('name', 'min', 'max', 'mid'));
    console.log(tableRow('-'.repeat(16), '-'.repeat(5), '-'.repeat(5), '-'.repeat(5)));

    for (const name in results) {
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;
      let mid = 0;

      for (const rps of results[name]) {
        mid += rps;
        min = Math.min(min, rps);
        max = Math.max(max, rps);
      }

      mid = Math.round(mid / ROUNDS);

      console.log(tableRow(name, min, max, mid));
    }
  });
});
