import { JwtPayload, JwtAuthenticity, JwtParsed } from '../constants/constants.js';
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
 * @param json - JSON object to encode
 * @returns a base64url-encoded string
 */
export declare const base64UrlEncode: (json: any) => string;
/**
 * Decodes a base64url-encoded string into a JSON object
 *
 * @param encoded - base64url-encoded string
 * @returns a decoded JSON object
 */
export declare const base64UrlDecode: (encoded: string) => unknown;
/**
 * Parses a JWT payload
 *
 * @param token - the JWT to be parsed
 */
export declare const parseToken: (token: string) => JwtParsed;
/**
 * Generates a JWT from the header, payload, and signature
 *
 * @param payload - data to include in the JWT payload
 * @returns a JWT
 */
export declare const generateToken: (payload: JwtPayload) => Promise<string>;
/**
 * Determines whether or not a JWT can be validated and authenticated
 *
 * @param token - JWT
 * @returns whether the JWT can be authenticated and, if not, the reason why it cannot
 */
export declare const isTokenAuthentic: (token: string) => Promise<JwtAuthenticity>;
/**
 * Determines whether or not a JWT is expired
 *
 * @param payload JWT parsed payload
 * @param dateToCheck Optional date to check if after the token's expiration (if not present, token expiration will be checked as of now)
 * @returns Whether or not a JWT is expired
 */
export declare const isTokenExpired: (payload: JwtPayload, dateToCheck?: Date) => boolean;
//# sourceMappingURL=authenticator.d.ts.map