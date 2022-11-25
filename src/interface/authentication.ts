export interface JwtHeader {
  alg: 'RS256';
  typ: 'JWT';
}

export interface JwtPayload {
  id?: string;
  data?: any;
  issued: Date;
  expires: Date;
}

export interface JwtValid {
  authentic: boolean;
  inauthenticReason?: string;
}
