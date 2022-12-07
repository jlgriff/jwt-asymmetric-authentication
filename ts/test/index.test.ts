/* eslint-disable max-len */
import * as assert from 'assert/strict';
import { test } from 'mocha';
import {
  base64UrlDecode, base64UrlEncode, calculateTokenExpiration, generateToken, isTokenAuthentic, JwtPayload, parseToken,
} from '../src/index.js';

process.env.NODE_ENV = 'test';
process.env.KEY_PATH_PRIVATE = '/dist/test/keys/test-key.private.pem';
process.env.KEY_PATH_PUBLIC = '/dist/test/keys/test-key.public.pem';

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

test('A token can be generated if a private key file is available in the configured directory', async () => {
  const iat: Date = new Date();
  const exp = calculateTokenExpiration(iat, 60);

  const payload = { iat, exp };
  const token = await generateToken(payload);
  assert.notEqual(token.length, 0);
});

test('A token can be authenticated if a public key file is available in the configured directory', async () => {
  const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIyMDIyLTEyLTA3VDAzOjQwOjMwLjY2OVoiLCJleHAiOiIyMDIyLTEyLTA3VDA0OjQwOjMwLjY2OVoifQ.bgbKfa672DoNoalJBnxXZ8f0tP589inDfRoqOfgPLyLXA7tLokMR3l_xsjN58ISo6cqOfeGTWu-AYdc_VjtytdlirL25pHcQDUGt4v92vxpdr4jjE0p_0pCoaPEuYwlBtBqnlZ8mDaKrI-mvs5MfGEBNTJa7vuZDuBCs7m22vQiBriwjl7gkU9R7dMYz-GTGSKwfxS2zp_-8dnlTjNt_li_0U2tyb9eorlOor1AFgKLRtwBWHQmcowBXCEey-5ZtWFtG491hae3Eegmu7Qm6OdE9KuiWfGaR3-ICEs8FcWDjeLJMRgVP9E0KW9iVZqdcqa4am0svdgwPfcDzL8-2Kw';
  const authenticity = await isTokenAuthentic(token);
  assert.equal(authenticity.authentic, true);
});

test('A generated token is parseable', async () => {
  const iat: Date = new Date();
  const exp = calculateTokenExpiration(iat, 60);

  const object: JwtPayload = { iat, exp, data: { property: 'value' } };
  const token = await generateToken(object);
  const { header, payload, signature } = parseToken(token);

  assert.equal(header.alg, 'RS256');
  assert.equal(header.typ, 'JWT');
  assert.deepEqual(payload.iat, iat);
  assert.deepEqual(payload.exp, exp);
  assert.notEqual(signature.length, 0);
});
