/* eslint-disable max-len */
import * as assert from 'assert/strict';
import { test } from 'mocha';
import { base64UrlDecode, base64UrlEncode, calculateTokenExpiration, generateToken, isTokenAuthentic, parseToken, } from '../src/index.js';
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
    const issued = new Date();
    const expires = calculateTokenExpiration(issued, 60);
    const payload = { issued, expires };
    const token = await generateToken(payload);
    assert.notEqual(token.length, 0);
});
test('A token can be authenticated if a public key file is available in the configured directory', async () => {
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3N1ZWQiOiIyMDIyLTEyLTA3VDAyOjU4OjU1LjQxNloiLCJleHBpcmVzIjoiMjAyMi0xMi0wN1QwMzo1ODo1NS40MTZaIn0.cWH4j55xNzzDP-Hfb9uXpsXDGMIY_3xO2MU-R7auv9jOdbdnzt3_vWWAjbwRGINqy-2UbV-C4SN6RgPPir3XVu6uNxHE52aDSS-Ge4xIwdaxqTURcQ-xrKfdJIjMBDNWjO_3iEs_gpEnUI97zgZsUPLrNZLGQdlYj8xuLR0wqfOxQ2FuYCubLXNe37aR4rIvYzz-03DdDdLBQGfgss_-ncMtqy1yb5us-l2wBo7fERGiG4fkPEaSZzmW_UyBQUqqKst1MN-FmJPZJ5fVv6n9LBkASw8-aS-aCfkikkerQYwi3cLUii0oN7lnERfPLHMFrR3p-tCKGFfO47kiZVmC9A';
    const authenticity = await isTokenAuthentic(token);
    assert.equal(authenticity.authentic, true);
});
test('A generated token is parseable', async () => {
    const issued = new Date();
    const expires = calculateTokenExpiration(issued, 60);
    const object = { issued, expires, data: { property: 'value' } };
    const token = await generateToken(object);
    const { header, payload, signature } = parseToken(token);
    assert.equal(header.alg, 'RS256');
    assert.equal(header.typ, 'JWT');
    assert.deepEqual(payload.issued, issued);
    assert.deepEqual(payload.expires, expires);
    assert.notEqual(signature.length, 0);
});
//# sourceMappingURL=index.test.js.map