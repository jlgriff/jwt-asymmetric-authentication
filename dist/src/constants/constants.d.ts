export declare const JWT_DATE_CLAIM_NAMES: string[];
export interface JwtHeader {
    /**
     * Algorithm: This claim is a required registered claim in a JWT (JSON Web Token) that specifies the cryptographic algorithm used to secure the JWT.
     *
     * The value of this claim is a string that identifies the algorithm used to sign or encrypt the JWT, such as "HS256" for HMAC-SHA256, "RS256" for RSA-SHA256, or "ES256" for ECDSA-SHA256.
     */
    alg?: 'RS256' | 'HS256' | 'RS256' | 'ES256';
    /**
     * Token Type: This claim is used to declare the media type of the JWT.
     *
     * The value of this claim is a string that specifies the media type of the token. The media type is usually set to "JWT" to indicate that the token is a JSON Web Token.
     */
    typ?: 'JWT';
    /**
     * Content Type: This claim is used to declare the content type of the JWT.
     *
     * The value of this claim is a string that specifies the content type of the token. It is typically used to indicate that the token contains a nested JWT, such as a signed or encrypted JWT.
     */
    cty?: 'JWT';
}
export interface JwtPayload {
    /**
     * Issuer: This claim identifies the principal that issued the JWT.
     *
     * The value of this claim is a string or URI that uniquely identifies the issuer. It can be used to verify that the token was issued by a trusted party.
     */
    iss?: string;
    /**
     * Subject: This claim identifies the subject of the JWT.
     *
     * The value of this claim is a string or URI that uniquely identifies the subject. It can be used to verify that the token is being used by the intended subject.
     */
    sub?: string;
    /**
     * Audience: This claim identifies the recipients that the JWT is intended for.
     *
     * The value of this claim is either a string or an array of strings that represent the intended recipients. It can be used to verify that the token was intended for a specific audience.
     */
    aud?: string | string[];
    /**
     * Expiration Time: This claim identifies the expiration time of the JWT.
     *
     * The value of this claim is a numeric date/time value that represents the expiration time of the token. It can be used to verify that the token has not expired.
     */
    exp?: Date;
    /**
     * Not Before: This claim identifies the time before which the JWT must not be accepted for processing.
     *
     * The value of this claim is a numeric date/time value that represents the earliest time that the token can be used. It can be used to verify that the token is being used within a valid timeframe.
     */
    nbf?: Date;
    /**
     * Issued At: This claim identifies the time at which the JWT was issued.
     *
     * The value of this claim is a numeric date/time value that represents the time at which the token was issued. It can be used to determine the age of the token.
     */
    iat?: Date;
    /**
     * JWT ID: This claim provides a unique identifier for the JWT.
     *
     * The value of this claim is a string that can be used to uniquely identify the token. It can be used to prevent the same token from being used more than once.
     */
    jti?: string | number;
    /**
     * This provides an object for attaching any custom non-registered claims.
     */
    custom?: any;
}
export interface JwtParsed {
    header: JwtHeader;
    payload: JwtPayload;
    signature: string;
}
export interface JwtAuthenticity {
    authentic: boolean;
    inauthenticReason?: string;
}
//# sourceMappingURL=constants.d.ts.map