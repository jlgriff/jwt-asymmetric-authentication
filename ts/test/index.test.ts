/* eslint-disable max-len */
import * as assert from 'assert/strict';
import { test } from 'mocha';
import {
  base64UrlDecode, base64UrlEncode, generateToken, isTokenAuthentic, parseToken,
} from '../src/index.js';

process.env.NODE_ENV = 'test';
process.env.KEY_PATH_PRIVATE = '/dist/test/keys/test-key.private.pem';
process.env.KEY_PATH_PUBLIC = '/dist/test/keys/test-key.public.pem';

const TEST_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoiMjAyMi0xMi0wN1QwNTowNTo1My43ODdaIn0.Gn4tWLFn4buWc1fMPuUWf5kCJz77RJN7DDs8Kwc-GCbE6KE2vhr_Dv9_dnmMLeAzrRcF8zw7LHSC6yBEZquuf2grNdsPED8YMFooWSIZcq3G8fbRfgVCqcjUF0aENRqMVy3OfMXc-tflrdAL78X_2AFVk1W0TctMHSt0gw29DIEq435tQOZfndzL_cc-7PFP8Dyb0eK_KnGg26cCEqLRmq1WogFrlr2xE_jpk5XvsPtHPQnLTX_4QT7aUzvI8kgzjOoEfAS3uVDPzT3N9cSDft7rIxLxM5FmkkQClpMbsf0ng7GADFL7ZQk2PpAjtzDwkT-0D3a_trXaZMERtE6fcA';

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
    const payload = { sub: 'test', iat: new Date() };
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
