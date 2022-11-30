export {
  generateToken, isTokenAuthentic, calculateTokenExpiration, base64UrlEncode, base64UrlDecode,
} from './service/authenticator.js';

export { JwtHeader, JwtPayload, JwtAuthenticity } from './interface/authentication.js';
