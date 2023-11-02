/* eslint-disable max-len */
import * as assert from 'assert/strict';
import { test } from 'mocha';
import { base64UrlDecode, base64UrlEncode, generateToken, isTokenAuthentic, parseToken } from '../src/index.js';
import { isTokenExpired } from '../src/services/authenticator.js';

process.env.NODE_ENV = 'test';
process.env.KEY_PATH_PRIVATE = '/dist/test/keys/test-key.private.pem';
process.env.KEY_PATH_PUBLIC = '/dist/test/keys/test-key.public.pem';

const now = new Date();
const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
const oneYearFromNow = new Date(now.getTime() + 60 * 60 * 1000 * 365);
const oneYearAgo = new Date(now.getTime() - 60 * 60 * 1000 * 365);
const testToken = generateToken({ sub: 'test', iat: now, exp: oneHourFromNow });

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
    const { header, payload, signature } = parseToken(testToken);

    assert.equal(header.alg, 'RS256');
    assert.equal(header.typ, 'JWT');
    assert.deepEqual(payload.iat instanceof Date, true);
    assert.notEqual(signature.length, 0);
  });

  test('A 3-part token without content will not break the parser', async () => {
    const emptyToken = '..';
    const { header, payload, signature } = parseToken(emptyToken);

    assert.deepEqual(header, {});
    assert.deepEqual(payload, {});
    assert.equal(signature, '');
  });
});

describe('Test the generateToken function', () => {
  test('A token can be generated if a private key file is available in the configured directory', async () => {
    const payload = { sub: 'test', iat: now, exp: oneHourFromNow };
    const token = generateToken(payload);
    assert.notEqual(token.length, 0);
  });
});

describe('Test the isTokenAuthentic function', () => {
  test('A token can be authenticated if a public key file is available in the configured directory', async () => {
    const authenticity = isTokenAuthentic(testToken);
    assert.equal(authenticity.authentic, true);
  });

  test('A token can be authenticated even if it starts with \'Bearer \'', async () => {
    const bearerToken = `Bearer ${testToken}`;
    const authenticity = isTokenAuthentic(bearerToken);
    assert.equal(authenticity.authentic, true);
  });
});

describe('Test the isTokenExpired function', () => {
  test('A token is not expired if it\'s expiration is after the given date', async () => {
    const { payload } = parseToken(testToken);
    const beforeExp = isTokenExpired(payload, oneYearAgo);
    assert.equal(beforeExp, false);
  });

  test('A token is expired if it\'s expiration is before the given date', async () => {
    const { payload } = parseToken(testToken);
    const afterExp = isTokenExpired(payload, oneYearFromNow);
    assert.equal(afterExp, true);
  });
});
