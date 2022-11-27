import crypto, { createPrivateKey, createPublicKey, } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
let privateKey;
let publicKey;
/**
 * Calculates an expiration date by incrementing the given date by a configured number of minutes
 *
 * @param date - date to calculate an expiration for
 * @param minutesToAdd - number of minutes to add to the passed-in date
 * @returns a date later than the given date
 */
export const calculateTokenExpiration = (date, minutesToAdd) => {
    const expires = new Date(date);
    expires.setMinutes(expires.getMinutes() + minutesToAdd);
    return expires;
};
/**
 * Gets the current directory path
 *
 * @returns the current import's directory path
 */
const getDirectory = () => path.dirname(fileURLToPath(import.meta.url));
/**
 * Creates a public key from the bundled public certificate file
 *
 * @returns a public key object from the bundled public certificate file
 */
const loadPublicKey = async () => {
    let filepath;
    if (!process.env.KEY_PATH_PUBLIC) {
        throw new Error('No KEY_PATH_PUBLIC .env config has been set. Set it to the filepath of the public key.  e.g. \'/keys/public.pem\'');
    }
    try {
        filepath = path.resolve(`${getDirectory()}${process.env.KEY_PATH_PUBLIC}`);
        const rsaKey = await fs.readFile(filepath, 'utf-8');
        return createPublicKey(rsaKey);
    }
    catch (e) {
        throw new Error(`No public key file could be found at ${filepath}. Make sure that the KEY_PATH_PUBLIC .env config has been set and is pointed to the correct filepath.`);
    }
};
/**
 * Creates a private key from the bundled public certificate file
 *
 * @returns a private key object from the bundled public certificate file
 */
const loadPrivateKey = async () => {
    let filepath;
    if (!process.env.KEY_PATH_PRIVATE) {
        throw new Error('No KEY_PATH_PRIVATE .env config has been set. Set it to the filepath of the private key. e.g. \'/keys/private.pem\'');
    }
    try {
        filepath = path.resolve(`${getDirectory()}${process.env.KEY_PATH_PRIVATE}`);
        const rsaKey = await fs.readFile(filepath, 'utf-8');
        return createPrivateKey(rsaKey);
    }
    catch (e) {
        throw new Error(`No private key file could be found at ${filepath}. Make sure that the KEY_PATH_PRIVATE env config has been set and is pointed to the correct relative filepath.`);
    }
};
/**
 * Encodes a payload via base64url
 *
 * @param json - payload to base64url encode
 * @returns a base64url-encoded payload
 */
const base64UrlEncodeJSON = (json) => Buffer.from(JSON.stringify(json)).toString('base64url');
/**
 * Decodes a base64url-encoded payload
 *
 * @param encoded - base64url-encoded payload
 * @returns an unencrypted payload
 */
const base64UrlDecodeToJSON = (encoded) => JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
/**
 * Generates a JWT signature from the header, payload, and private key
 *
 * @param encodedHeader - base64url-encoded JWT header
 * @param encodedPayload - base64url-encoded JWT payload
 * @param privKey - private key object
 * @returns a JWT signature
 */
const generateSignature = (encodedHeader, encodedPayload, privKey) => {
    const str = `${encodedHeader}.${encodedPayload}`;
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(str);
    return sign.sign(privKey, 'base64url');
};
/**
 * Generates a JWT token from the header, payload, and signature
 *
 * @param payload - data to include in the JWT payload
 * @returns a JWT token
 */
export const generateToken = async (payload) => {
    if (!privateKey) {
        privateKey = await loadPrivateKey();
    }
    const encodedHeader = base64UrlEncodeJSON({ alg: 'RS256', typ: 'JWT' });
    const encodedPayload = base64UrlEncodeJSON(payload);
    const encodedSignature = generateSignature(encodedHeader, encodedPayload, privateKey);
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
};
/**
 * Determines whether a JWT token can be validated and authenticated or not
 *
 * @param token - JWT token
 * @returns whether the JWT token can be authenticated and, if not, the reason why it cannot
 */
export const isTokenAuthentic = async (token) => {
    if (!publicKey) {
        publicKey = await loadPublicKey();
    }
    const parts = token.split('.');
    if (parts.length < 3) {
        return { authentic: false, inauthenticReason: 'JWT does not have a header, payload, and signature' };
    }
    const header = base64UrlDecodeToJSON(parts[0]);
    const payload = base64UrlDecodeToJSON(parts[1]);
    if (header.alg !== 'RS256' || header.typ !== 'JWT') {
        return { authentic: false, inauthenticReason: 'JWT header is incorrect' };
    }
    const signature = parts[2];
    const { expires } = payload;
    if (expires && expires < new Date()) {
        return { authentic: false, inauthenticReason: 'JWT is expired' };
    }
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(`${parts[0]}.${parts[1]}`);
    const isAuthentic = verify.verify(publicKey, signature, 'base64url');
    const inauthenticReason = isAuthentic ? undefined : 'JWT failed to authenticate against the public key';
    return { authentic: isAuthentic, inauthenticReason };
};
