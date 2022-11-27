export interface JwtHeader {
    alg: 'RS256';
    typ: 'JWT';
    data?: any;
}
export interface JwtPayload {
    id?: string;
    data?: any;
    issued: Date;
    expires: Date;
}
export interface JwtAuthenticity {
    authentic: boolean;
    inauthenticReason?: string;
}
