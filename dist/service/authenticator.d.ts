import { JwtPayload, JwtAuthenticity } from '../interface/authentication';
/**
 * Calculates an expiration date by incrementing the given date by a configured number of minutes
 *
 * @param date - date to calculate an expiration for
 * @param minutesToAdd - number of minutes to add to the passed-in date
 * @returns a date later than the given date
 */
export declare const calculateTokenExpiration: (date: Date, minutesToAdd: number) => Date;
/**
 * Encodes a JSON object into a base64url-encoded string
 *
 * @param object - JSON object to encode
 * @returns a base64url-encoded string
 */
export declare const base64UrlEncode: (object: any) => string;
/**
 * Decodes a base64url-encoded string into a JSON object
 *
 * @param encoded - base64url-encoded string
 * @returns a decoded JSON object
 */
export declare const base64UrlDecode: (encoded: string) => any;
/**
 * Generates a JWT token from the header, payload, and signature
 *
 * @param payload - data to include in the JWT payload
 * @returns a JWT token
 */
export declare const generateToken: (payload: JwtPayload) => Promise<string>;
/**
 * Determines whether a JWT token can be validated and authenticated or not
 *
 * @param token - JWT token
 * @returns whether the JWT token can be authenticated and, if not, the reason why it cannot
 */
export declare const isTokenAuthentic: (token: string) => Promise<JwtAuthenticity>;
