/* eslint-disable max-len */
import * as assert from 'assert/strict';
import { test } from 'mocha';
import {
  base64UrlDecode, base64UrlEncode, generateToken, isTokenAuthentic, parseToken,
} from '../src/index.js';
import { isTokenExpired } from '../src/services/authenticator.js';

process.env.NODE_ENV = 'test';
process.env.KEY_PATH_PRIVATE = '/dist/test/keys/test-key.private.pem';
process.env.KEY_PATH_PUBLIC = '/dist/test/keys/test-key.public.pem';

const TEST_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoiMjAyMy0wNS0yNlQxODowNzozNi44NTdaIiwiZXhwIjoiMjAyMy0wNS0yNlQxOTowNzozNi44NTdaIn0.Lnzb6lCN9LGed7HtS2SuADmpAc0FaYxa_KKFtQT5RqyGQtmLuGuJvG9k6ekHtKW175YgvJLdSRkzKqjehlcS4SSrTMEwXIbpRKREKFd07SwyCGj7pIZXlQaaO8bS1f4wHq0StiyJztFRJAujUZLeU_dKntRSDLOW5GjmieyJ3RgMaylyygePvbNYLK62WG4AKZNTHUqTgAFINmSBntd4gta406AIdkASor_7AjU9m3proFDWI3DMe-WUucDmSFKcuUpxvs12ohRpj-GPPKCwdCmhUl-5IZMXOMsuxbppH31QBX3tepSWgj2Lgr6-Fawe5Ee68QIz70gw7FdWXNLoyQ';

test('An object will have the same value after being encoded and decoded', () => {
  const object = {
    name: 'name',
    value: 'value',
    subObject: { name: 'name', value: 'value' },
  };

  const encoded = base64UrlEncode(object);
  const decoded = base64UrlDecode(encoded);

  assert.deepEqual(object, decoded);
});

describe('Test the parseToken function', () => {
  test('A token is parseable', async () => {
    const { header, payload, signature } = parseToken(TEST_TOKEN);

    assert.equal(header.alg, 'RS256');
    assert.equal(header.typ, 'JWT');
    assert.deepEqual(payload.iat instanceof Date, true);
    assert.notEqual(signature.length, 0);
  });
});

describe('Test the generateToken function', () => {
  test('A token can be generated if a private key file is available in the configured directory', async () => {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    const payload = { sub: 'test', iat: now, exp: oneHourFromNow };
    const token = await generateToken(payload);
    assert.notEqual(token.length, 0);
  });
});

describe('Test the isTokenAuthentic function', () => {
  test('A token can be authenticated if a public key file is available in the configured directory', async () => {
    const token = TEST_TOKEN;
    const authenticity = await isTokenAuthentic(token);
    assert.equal(authenticity.authentic, true);
  });

  test('A token can be authenticated even if it starts with \'Bearer \'', async () => {
    const bearerToken = `Bearer ${TEST_TOKEN}`;
    const authenticity = await isTokenAuthentic(bearerToken);
    assert.equal(authenticity.authentic, true);
  });
});

describe('Test the isTokenExpired function', () => {
  test('A token is not expired if it\'s expiration is after the given date', async () => {
    const { payload } = parseToken(TEST_TOKEN);
    const beforeExp = isTokenExpired(payload, new Date('2000-01-01'));
    assert.equal(beforeExp, false);
  });

  test('A token is expired if it\'s expiration is before the given date', async () => {
    const { payload } = parseToken(TEST_TOKEN);
    const afterExp = isTokenExpired(payload, new Date('3000-01-01'));
    assert.equal(afterExp, true);
  });
});
