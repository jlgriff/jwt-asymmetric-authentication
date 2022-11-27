import { JwtPayload, JwtAuthenticity } from '../interface/authentication.js';
/**
 * Calculates an expiration date by incrementing the given date by a configured number of minutes
 *
 * @param date - date to calculate an expiration for
 * @param minutesToAdd - number of minutes to add to the passed-in date
 * @returns a date later than the given date
 */
export declare const calculateTokenExpiration: (date: Date, minutesToAdd: number) => Date;
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
