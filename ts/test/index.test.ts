import * as assert from 'assert/strict';
import { test } from 'mocha';
import { base64UrlDecode, base64UrlEncode } from '../src/index.js';

process.env.NODE_ENV = 'test';
process.env.KEY_PATH_PRIVATE = '/src/test/keys/test-key.private.pem';
process.env.KEY_PATH_PUBLIC = '/src/test/keys/test-key.public.pem';

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
