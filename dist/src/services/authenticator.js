import { createSign, createVerify, createPrivateKey, createPublicKey, } from 'crypto';
import { resolve, dirname } from 'path';
import { readFile } from 'fs/promises';
import { findUpSync } from 'find-up';
import { JWT_DATE_CLAIM_NAMES, } from '../constants/authentication-constants.js';
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
 * Finds the directory for the project
 *
 * @returns the project's directory
 */
const findProjectDirectory = () => {
    const filePath = findUpSync('package.json', {});
    return filePath && dirname(filePath);
};
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
        filepath = resolve(`${findProjectDirectory()}${process.env.KEY_PATH_PUBLIC}`);
        const rsaKey = await readFile(filepath, 'utf-8');
        return createPublicKey(rsaKey);
    }
    catch (e) {
        throw new Error(`No public key file could be found at ${findProjectDirectory()}${process.env.KEY_PATH_PUBLIC}. `
            + 'Make sure that the KEY_PATH_PUBLIC .env config has been set and is pointed to the correct filepath.');
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
        filepath = resolve(`${findProjectDirectory()}${process.env.KEY_PATH_PRIVATE}`);
        const rsaKey = await readFile(filepath, 'utf-8');
        return createPrivateKey(rsaKey);
    }
    catch (e) {
        throw new Error(`No private key file could be found at ${findProjectDirectory()}${process.env.KEY_PATH_PUBLIC}. `
            + 'Make sure that the KEY_PATH_PRIVATE env config has been set and is pointed to the correct relative filepath.');
    }
};
/**
 * Encodes a JSON object into a base64url-encoded string
 *
 * @param json - JSON object to encode
 * @returns a base64url-encoded string
 */
export const base64UrlEncode = (json) => Buffer.from(JSON.stringify(json)).toString('base64url');
/**
 * Decodes a base64url-encoded string into a JSON object
 *
 * @param encoded - base64url-encoded string
 * @returns a decoded JSON object
 */
export const base64UrlDecode = (encoded) => JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
/**
 * Parses a JWT payload
 *
 * @param token - the JWT to be parsed
 */
export const parseToken = (token) => {
    const parts = token.split('.');
    if (parts.length < 3) {
        throw new Error('JWT is invalid', { cause: 'JWT does not have a header, payload, and signature' });
    }
    const header = base64UrlDecode(parts[0]);
    const payload = base64UrlDecode(parts[1]);
    if (header !== null && typeof header === 'object' && payload !== null && typeof payload === 'object') {
        const headerObj = header;
        const payloadObj = payload;
        if (!('alg' in headerObj)) {
            throw new Error('JWT header is missing an \'alg\' property');
        }
        if (!('typ' in headerObj)) {
            throw new Error('JWT header is missing a \'typ\' property');
        }
        JWT_DATE_CLAIM_NAMES.forEach((name) => {
            if (name in payloadObj) {
                payloadObj[name] = new Date(payloadObj[name]);
            }
        });
        return {
            header: headerObj,
            payload: payloadObj,
            signature: parts[2],
        };
    }
    throw new Error('JWT could not be parsed', { cause: `The following JWT could not be parsed into an object: ${token}` });
};
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
    const sign = createSign('RSA-SHA256');
    sign.update(str);
    return sign.sign(privKey, 'base64url');
};
/**
 * Generates a JWT from the header, payload, and signature
 *
 * @param payload - data to include in the JWT payload
 * @returns a JWT
 */
export const generateToken = async (payload) => {
    if (!privateKey) {
        privateKey = await loadPrivateKey();
    }
    const encodedHeader = base64UrlEncode({ alg: 'RS256', typ: 'JWT' });
    const encodedPayload = base64UrlEncode(payload);
    const encodedSignature = generateSignature(encodedHeader, encodedPayload, privateKey);
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
};
/**
 * Determines whether a JWT can be validated and authenticated or not
 *
 * @param token - JWT
 * @returns whether the JWT can be authenticated and, if not, the reason why it cannot
 */
export const isTokenAuthentic = async (token) => {
    if (!publicKey) {
        publicKey = await loadPublicKey();
    }
    const { header, payload, signature } = parseToken(token);
    if (header.alg !== 'RS256' || header.typ !== 'JWT') {
        return { authentic: false, inauthenticReason: 'JWT header is incorrect' };
    }
    const { exp } = payload;
    if (exp && exp < new Date()) {
        return { authentic: false, inauthenticReason: 'JWT is expired' };
    }
    const verify = createVerify('RSA-SHA256');
    const parts = token.split('.');
    verify.update(`${parts[0]}.${parts[1]}`);
    const isAuthentic = verify.verify(publicKey, signature, 'base64url');
    const inauthenticReason = isAuthentic ? undefined : 'JWT failed to authenticate against the public key';
    return { authentic: isAuthentic, inauthenticReason };
};
//# sourceMappingURL=authenticator.js.map