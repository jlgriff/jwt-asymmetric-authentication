import crypto, {
  createPrivateKey, createPublicKey, KeyObject, Verify,
} from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { JwtHeader, JwtPayload, JwtAuthenticity } from '../interface/authentication.js';

let privateKey: KeyObject | undefined;
let publicKey: KeyObject | undefined;

/**
 * Calculates an expiration date by incrementing the given date by a configured number of minutes
 *
 * @param date - date to calculate an expiration for
 * @param minutesToAdd - number of minutes to add to the passed-in date
 * @returns a date later than the given date
 */
export const calculateTokenExpiration = (date: Date, minutesToAdd: number): Date => {
  const expires: Date = new Date(date);
  expires.setMinutes(expires.getMinutes() + minutesToAdd);
  return expires;
};

/**
 * Gets the current directory path
 *
 * @returns the current import's directory path
 */
const getDirectory = (): string => path.dirname(fileURLToPath(import.meta.url));

/**
 * Creates a public key from the bundled public certificate file
 *
 * @returns a public key object from the bundled public certificate file
 */
const loadPublicKey = async (): Promise<KeyObject> => {
  let filepath;
  if (!process.env.KEY_PATH_PUBLIC) {
    throw new Error('No KEY_PATH_PUBLIC .env config has been set. Set it to the filepath of the public key.  e.g. \'/keys/public.pem\'');
  }
  try {
    filepath = path.resolve(`${getDirectory()}${process.env.KEY_PATH_PUBLIC}`);
    const rsaKey = await fs.readFile(filepath, 'utf-8');
    return createPublicKey(rsaKey);
  } catch (e) {
    throw new Error(`No public key file could be found at ${getDirectory()}${process.env.KEY_PATH_PUBLIC}. `
      + 'Make sure that the KEY_PATH_PUBLIC .env config has been set and is pointed to the correct filepath.');
  }
};

/**
 * Creates a private key from the bundled public certificate file
 *
 * @returns a private key object from the bundled public certificate file
 */
const loadPrivateKey = async (): Promise<KeyObject> => {
  let filepath;
  if (!process.env.KEY_PATH_PRIVATE) {
    throw new Error('No KEY_PATH_PRIVATE .env config has been set. Set it to the filepath of the private key. e.g. \'/keys/private.pem\'');
  }
  try {
    filepath = path.resolve(`${getDirectory()}${process.env.KEY_PATH_PRIVATE}`);
    const rsaKey = await fs.readFile(filepath, 'utf-8');
    return createPrivateKey(rsaKey);
  } catch (e) {
    throw new Error(`No private key file could be found at ${getDirectory()}${process.env.KEY_PATH_PUBLIC}. `
      + 'Make sure that the KEY_PATH_PRIVATE env config has been set and is pointed to the correct relative filepath.');
  }
};

/**
 * Encodes a JSON object into a base64url-encoded string
 *
 * @param json - JSON object to encode
 * @returns a base64url-encoded string
 */
export const base64UrlEncode = (json: any): string => Buffer.from(JSON.stringify(json)).toString('base64url');

/**
 * Decodes a base64url-encoded string into a JSON object
 *
 * @param encoded - base64url-encoded string
 * @returns a decoded JSON object
 */
export const base64UrlDecode = (encoded: string): any => JSON.parse(
  Buffer.from(encoded, 'base64url').toString('utf8'),
);

/**
 * Generates a JWT signature from the header, payload, and private key
 *
 * @param encodedHeader - base64url-encoded JWT header
 * @param encodedPayload - base64url-encoded JWT payload
 * @param privKey - private key object
 * @returns a JWT signature
 */
const generateSignature = (
  encodedHeader: string,
  encodedPayload: string,
  privKey: KeyObject,
): string => {
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
export const generateToken = async (payload: JwtPayload) => {
  if (!privateKey) {
    privateKey = await loadPrivateKey();
  }
  const encodedHeader = base64UrlEncode({ alg: 'RS256', typ: 'JWT' });
  const encodedPayload = base64UrlEncode(payload);
  const encodedSignature = generateSignature(encodedHeader, encodedPayload, privateKey);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
};

/**
 * Determines whether a JWT token can be validated and authenticated or not
 *
 * @param token - JWT token
 * @returns whether the JWT token can be authenticated and, if not, the reason why it cannot
 */
export const isTokenAuthentic = async (token: string): Promise<JwtAuthenticity> => {
  if (!publicKey) {
    publicKey = await loadPublicKey();
  }

  const parts: string[] = token.split('.');
  if (parts.length < 3) {
    return { authentic: false, inauthenticReason: 'JWT does not have a header, payload, and signature' };
  }

  const header: JwtHeader = base64UrlDecode(parts[0]);
  const payload: JwtPayload = base64UrlDecode(parts[1]);
  if (header.alg !== 'RS256' || header.typ !== 'JWT') {
    return { authentic: false, inauthenticReason: 'JWT header is incorrect' };
  }

  const signature = parts[2];
  const { expires } = payload;
  if (expires && expires < new Date()) { return { authentic: false, inauthenticReason: 'JWT is expired' }; }

  const verify: Verify = crypto.createVerify('RSA-SHA256');
  verify.update(`${parts[0]}.${parts[1]}`);

  const isAuthentic: boolean = verify.verify(publicKey, signature, 'base64url');
  const inauthenticReason = isAuthentic ? undefined : 'JWT failed to authenticate against the public key';
  return { authentic: isAuthentic, inauthenticReason };
};
