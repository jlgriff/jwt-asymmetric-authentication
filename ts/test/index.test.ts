/* eslint-disable max-len */
import * as assert from 'assert/strict';
import { test } from 'mocha';
import {
  base64UrlDecode, base64UrlEncode, generateToken, isTokenAuthentic,
} from '../src/index.js';

process.env.NODE_ENV = 'test';
process.env.KEY_PATH_PRIVATE = '/dist/test/keys/test-key.private.pem';
process.env.KEY_PATH_PUBLIC = '/dist/test/keys/test-key.public.pem';

test('An object should have the same value after being encoded and decoded', () => {
  const object = {
    name: 'name',
    value: 'value',
    subObject: { name: 'name', value: 'value' },
  };

  const encoded = base64UrlEncode(object);
  const decoded = base64UrlDecode(encoded);

  assert.deepEqual(object, decoded);
});

test('A token should be able to be generated if a private key file is available in the configured directory', async () => {
  const payload = { issued: new Date(), expires: new Date() };
  const token = await generateToken(payload);
  assert.notEqual(token.length, 0);
});

test('A token should be able to be authenticated if a public key file is available in the configured directory', async () => {
  const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3N1ZWQiOiIyMDIyLTEyLTA2VDIzOjA3OjIzLjU5NVoiLCJleHBpcmVzIjoiMjAyMi0xMi0wNlQyMzowNzoyMy41OTVaIn0.WwhAxXtP3Jt8S9lTR2mvBBW0zO_rFwyfzAUJhFPB5fZV4FTobfvXuL1AhE-dQeIYUMHjs-MxleImc6ExTxoxOWyW2JtojbYqXbEvQAaYElGU8fBYZvbpRBSdSSvvjhUkgDcFXXzLrWQb0cgAqOOFb9VYPc9KzsXXzDGyApDrhkd_mTqRRBI3SEcXXsSklPVnNgiBL-49u-Xp5LXehdWh_Jzjq0hXdo0xEULhe3IWx1XDMF1WCCvp1n6EIX0kaIjH0aMk2oCHWNj1CyOvFkzVsK2UXV0DkCiQTkTILJ8LVxavTa6Rk3m60Jc0R8npuzKhT4OB28N-IiN19u_peiDkqg';
  const authenticity = await isTokenAuthentic(token);
  assert.equal(authenticity.authentic, true);
});
