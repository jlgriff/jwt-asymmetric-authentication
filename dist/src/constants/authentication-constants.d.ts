export declare const JWT_DATE_CLAIM_NAMES: string[];
export interface JwtHeader {
    alg: 'RS256';
    typ: 'JWT';
}
export interface JwtPayload {
    iss?: string;
    sub?: string | number;
    aud?: string;
    exp?: Date;
    nbf?: Date;
    iat?: Date;
    jti?: string | number;
    name?: string;
    given_name?: string;
    family_name?: string;
    middle_name?: string;
    nickname?: string;
    preferred_username?: string;
    profile?: string;
    picture?: string;
    website?: string;
    email?: string;
    email_verified?: string;
    gender?: string;
    birthdate?: Date;
    zoneinfo?: any;
    locale?: any;
    updated_at?: Date;
    cnf?: string | number;
    orig?: string;
    dest?: string;
    mky?: string;
    events?: any[];
    toe?: Date;
    txn?: string | number;
    sid?: string | number;
    client_id?: string | number;
    at_use_nbr?: number;
    roles?: any[];
    groups?: any[];
    entitlements?: any[];
    data?: any;
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
//# sourceMappingURL=authentication-constants.d.ts.map